Feature: Connect to unisat wallet extension
  Test connecting to bitcoin lightning with Unisat wallet extension and simulating payment

  Scenario: Connect and Simulate Payment with Unisat
    Given Test Browser is opened - FU
    When Click on Lightning Connect Button - FU
    Then Connect Unisat Wallet - FU
    And Simulate Unisat Payment - FU