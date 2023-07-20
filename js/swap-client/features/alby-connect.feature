Feature: Connect to Alby wallet extension
  Test connecting to bitcoin lightning with Alby

  Scenario: Alice & Bob logs in
    Given Test Browser is opened - FA
    When Click on Lightning Connect Button - FA
    Then Connect Alby Wallet - FA
    And Simulate Alby Payment - FA
