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
      if (error) {
        throw new Error('Error occurred while processing coverage XML.', error)
      } else {
        // Find the first coverage element and get its line-rate attribute value.
        const lineRate = xpath.evalFirst(json, '//coverage', 'line-rate')

        if (isNaN(lineRate)) {
          throw new Error(
            "Coverage 'line-rate' attribute value is not a number."
          )
        }

        // Set output for other workflow steps to use
        // Multiply the lineRate by 100 to return as percentage
        core.setOutput('coverage', (lineRate ?? 0) * 100)
      }
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
