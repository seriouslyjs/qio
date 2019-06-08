import {Suite} from 'benchmark'
import {FutureInstance} from 'fluture'

import {noop} from '../../src/internals/Noop'
import {IO} from '../../src/main/FIO'
import {defaultRuntime} from '../../src/runtimes/DefaultRuntime'

import {PrintLn} from './PrintLn'

const runtime = defaultRuntime()

export const RunSuite = <E, A>(
  name: string,
  test: {
    fio: IO<E, A>
    fluture: FutureInstance<unknown, unknown>
  }
) => {
  PrintLn('##', name)
  PrintLn('```')
  const suite = new Suite(name)
  suite
    .add(
      'FIO',
      (cb: IDefer) => {
        runtime.execute(test.fio, () => cb.resolve())
      },
      {defer: true}
    )
    .add(
      'Fluture',
      (cb: IDefer) => {
        test.fluture.fork(noop, () => cb.resolve())
      },
      {defer: true}
    )

    .on('cycle', (event: Event) => {
      PrintLn(String(event.target))
    })
    .on('complete', function(this: Suite): void {
      PrintLn(
        'Fastest is ' +
          this.filter('fastest')
            .map((i: {name: string}) => i.name)
            .join('') +
          '\n```'
      )
    })
    .run()
}
