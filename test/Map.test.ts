/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {IO} from '../'

import {Counter} from './internals/Counter'
import {ForkNRun} from './internals/ForkNRun'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'

describe('map', () => {
  const fR = ForkNRun({scheduler: testScheduler()})
  it('should convert the value', async () => {
    const actual = await IO.of(10)
      .map((i: number) => i + 1)
      .toPromise({scheduler: testScheduler()})
    const expected = 11
    assert.equal(actual, expected)
  })
  it('should capture exceptions on resolve', () => {
    const counter = Counter()
    const {timeline} = fR(
      counter.inc.map(() => {
        throw new Error('FAILURE')
      })
    )
    const actual = timeline.list()
    const expected = timeline.create(['REJECT', 1, 'Error: FAILURE'])

    assert.deepStrictEqual(actual, expected)
  })
  ResolvingIOSpec(() => IO.of(10).map(i => 100))
  RejectingIOSpec(() =>
    IO.of(10).map(i => {
      throw new Error('FAILED')
    })
  )
})
