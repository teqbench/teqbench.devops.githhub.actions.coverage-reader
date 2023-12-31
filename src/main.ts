import * as core from '@actions/core'

import xml2js from 'xml2js'
import xpath from 'xml2js-xpath'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const xml: string = core.getInput('coverage-xml')
    const parser = new xml2js.Parser()

    parser.parseString(xml, function (error, json) {
      // The callback function appears to modify the thrown exception and the outter try catch block
      // does not interpret the caught error as an 'instanceof Error'...Use a try catch block in the
      // callback function to capture any error thrown in the callback and call setFailed.
      try {
        if (error) {
          throw new Error(
            'Error occurred while processing coverage XML.',
            error
          )
        } else {
          // Find the first coverage element and get its line-rate attribute value.
          const lineRate = xpath.evalFirst(json, '//coverage', 'line-rate')

          if (
            lineRate === null ||
            lineRate === '' ||
            isNaN(Number(lineRate.toString()))
          ) {
            throw new Error(
              "Coverage 'line-rate' attribute value is not a number."
            )
          }

          // Set output for other workflow steps to use
          // Multiply the lineRate by 100 to return as percentage
          const coverage: number = (lineRate ?? 0) * 100
          core.setOutput('coverage', coverage)

          // The pluse sign before coverage var is to remove any trailing zeros as a result of the toFixed operation.
          core.setOutput('coverage-foratted', `${+coverage.toFixed(2)}%`)
        }
      } catch (e) {
        // Fail the workflow run if an error occurs
        if (e instanceof Error) {
          core.setFailed(e.message)
        }
      }
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
