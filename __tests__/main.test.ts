/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
// let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('Read valid coverage XML and return 70.8%', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'coverage-xml':
          return '<coverage line-rate="0.708"></coverage>'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(setOutputMock).toHaveBeenCalledTimes(2)
    expect(setOutputMock).toHaveBeenCalledWith('coverage', 70.8)
    expect(setOutputMock).toHaveBeenCalledWith('coverage-foratted', '70.8%')

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('Read valid coverage XML and return 70%', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'coverage-xml':
          return '<coverage line-rate="0.70"></coverage>'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(setOutputMock).toHaveBeenCalledTimes(2)
    expect(setOutputMock).toHaveBeenCalledWith('coverage', 70)
    expect(setOutputMock).toHaveBeenCalledWith('coverage-foratted', '70%')

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('coverage xml line-rate not a number', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'coverage-xml':
          return '<coverage line-rate="nan"></coverage>'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      "Coverage 'line-rate' attribute value is not a number."
    )
    expect(errorMock).not.toHaveBeenCalled()
  })
})
