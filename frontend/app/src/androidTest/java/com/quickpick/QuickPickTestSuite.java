package com.quickpick;

import com.quickpick.login.LoginTestSuite;
import com.quickpick.session.JoinSessionInvalidTestCase;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({LoginTestSuite.class, JoinSessionInvalidTestCase.class})
public class QuickPickTestSuite {
}
