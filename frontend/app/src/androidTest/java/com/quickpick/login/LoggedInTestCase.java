package com.quickpick.login;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import com.quickpick.LoginActivity;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static com.quickpick.login.LoginUtils.checkWelcomeTextIsDisplayed;

@RunWith(AndroidJUnit4.class)
public class LoggedInTestCase {

    @Rule
    public ActivityScenarioRule<LoginActivity> mActivityTestRule = new ActivityScenarioRule<>(LoginActivity.class);

    @Test
    public void loggedInTestCase() {
        checkWelcomeTextIsDisplayed();
    }
}
