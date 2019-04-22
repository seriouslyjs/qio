/**
 * Created by tushar on 2019-03-10
 */

import {Cancel} from 'ts-scheduler'

import {AnyEnv} from '../envs/AnyEnv'
import {SchedulerEnv} from '../envs/SchedulerEnv'
import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {Catch} from '../operators/Catch'
import {Chain} from '../operators/Chain'
import {Map} from '../operators/Map'
import {Once} from '../operators/Once'
import {Race} from '../operators/Race'
import {OR, Zip} from '../operators/Zip'
import {C} from '../sources/Computation'
import {Timeout} from '../sources/Timeout'

const NOOP = () => {}
const RETURN_NOOP = () => NOOP

/**
 * Base class for fearless IO.
 * It contains all the operators (`map`, `chain` etc.) that help in creating powerful compositions.
 *
 * @example
 *
 * ```typescript
 *
 * import {IO} from 'fearless-io'
 *
 * // Create a pure version of `console.log` called `putStrLn`
 * const putStrLn = IO.encase((str: string) => console.log(str))
 *
 * const onError = (err) => {
 *   console.log(err)
 *   process.exit(1)
 * }
 *
 * const onSuccess = () => {
 *   console.log('Done!')
 * }
 *
 * const hello = putStrLn('Hello World!')
 *
 * hello.fork(onError, onSuccess)
 *
 * ```
 * @typeparam A The output of the side-effect.
 *
 */
export class IO<R1, A1> implements FIO<R1, A1> {
  /**
   * Accesses an environment for the effect
   */
  public static access<R = AnyEnv, A = unknown>(fn: (env: R) => A): IO<R, A> {
    return IO.to(
      C((env1, rej, res) => {
        res(fn(env1))
      })
    )
  }

  /**
   * Effect-fully accesses the environment of the effect.
   */
  public static accessM<R, A>(fn: (env: R) => IO<R, A>): IO<R, A> {
    return IO.environment<R>().chain(fn)
  }

  /**
   *
   * Takes in an effect-full function zip returns a pure function,
   * that takes in the same arguments zip wraps the result into an [[IO]]
   *
   */
  public static encase<A, G extends unknown[]>(
    fn: (...t: G) => A
  ): (...t: G) => IO<SchedulerEnv, A> {
    return (...t) => IO.to(C((env, rej, res) => res(fn(...t))))
  }

  /**
   *
   * Takes in a function that returns a `Promise` zip converts it to a function,
   * that takes the same set of arguments zip returns an [[IO]]
   * TODO: remove dependency on SchedulerEnv
   */
  public static encaseP<A, G extends unknown[]>(
    fn: (...t: G) => Promise<A>
  ): (...t: G) => IO<SchedulerEnv, A> {
    return (...t) =>
      IO.to(
        C((env, rej, res) => {
          void fn(...t)
            .then(res)
            .catch(rej)
        })
      )
  }

  /**
   * Creates an IO that resolves with the provided env
   */
  public static environment<R1 = unknown>(): IO<R1, R1> {
    return IO.to(C((env1, rej, res) => res(env1)))
  }

  /**
   * Constructor function to create an IO.
   * In most cases you should use [encase] [encaseP] etc. to create new IOs.
   * `from` is for more advanced usages and is intended to be used internally.
   */
  public static from<R, A>(
    cmp: (env: R, rej: REJ, res: RES<A>) => Cancel | void
  ): IO<R, A> {
    return IO.to(C(cmp))
  }

  /**
   * Creates an [[IO]] that never completes.
   */
  public static never(): IO<SchedulerEnv, never> {
    return IO.to(C(RETURN_NOOP))
  }

  /**
   * Creates an [[IO]] that always resolves with the same value.
   */
  public static of<A>(value: A): IO<SchedulerEnv, A> {
    return IO.to(C((env, rej, res) => res(value)))
  }

  /**
   * Creates an IO that always rejects with an error
   */
  public static reject(error: Error): IO<SchedulerEnv, never> {
    return IO.to(C((env, rej) => rej(error)))
  }

  /**
   * Creates an IO that resolves with the given value after a certain duration of time.
   */
  public static timeout<A>(value: A, duration: number): IO<SchedulerEnv, A> {
    return IO.to(new Timeout(duration, value))
  }

  private static to<R, A>(io: FIO<R, A>): IO<R, A> {
    return new IO(io)
  }

  private constructor(private readonly io: FIO<R1, A1>) {}

  /**
   * Catches a failing IO zip creates another IO
   */
  public catch<R2, A2>(ab: (a: Error) => FIO<R2, A2>): IO<R1 & R2, A1 | A2> {
    return IO.to(new Catch(this.io, ab))
  }

  /**
   * Chains two IOs such that one is executed after the other.
   */
  public chain<R2, A2>(ab: (a: A1) => FIO<R2, A2>): IO<R1 & R2, A2> {
    return IO.to(new Chain(this.io, ab))
  }

  /**
   * Delays an IO execution by the provided duration
   */
  public delay(duration: number): IO<R1, A1> {
    return IO.timeout(this.io, duration).chain(_ => _)
  }

  /**
   * Actually executes the IO
   */
  public fork(env: R1, rej: REJ, res: RES<A1>): Cancel {
    return this.io.fork(env, rej, res)
  }

  /**
   * Applies transformation on the resolve value of the IO
   */
  public map<B>(ab: (a: A1) => B): IO<R1, B> {
    return IO.to(new Map(this.io, ab))
  }

  /**
   * Creates a new IO<IO<A>> that executes only once
   */
  public once(): IO<SchedulerEnv, IO<R1, A1>> {
    return IO.of(IO.to(new Once(this)))
  }

  /**
   * Eliminates the dependency on the IOs original environment.
   * Creates an IO that can run in [DefaultEnv].
   */
  public provide(env: R1): IO<AnyEnv, A1> {
    return IO.to(C((env1, rej, res) => this.io.fork(env, rej, res)))
  }

  /**
   * Executes two IOs in parallel zip returns the value of the one that's completes first also cancelling the one pending.
   */
  public race<R2, A2>(b: FIO<R2, A2>): IO<R1 & R2, A1 | A2> {
    return IO.to(new Race(this.io, b))
  }

  /**
   * Converts the IO into a Promise
   */
  public async toPromise(env: R1): Promise<A1> {
    return new Promise<A1>((resolve, reject) => this.fork(env, reject, resolve))
  }

  /**
   * Combines two IO's into one zip then on fork executes them in parallel.
   */
  public zip<R2, A2>(b: FIO<R2, A2>): IO<R1 & R2, OR<A1, A2>> {
    return IO.to(new Zip(this.io, b))
  }
}
