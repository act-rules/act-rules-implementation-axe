const rulesAxeOptions = {
  /**
   * Rule: role attribute has valid value
   * Url: https://act-rules.github.io/rules/674b10
   *  - Ignore running check `fallbackrole`
   */
  '674b10': {
    checks: {
      'fallbackrole': { enabled: false }
    }
  }
}

module.exports = rulesAxeOptions