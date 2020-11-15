package com.quickpick.login;


import androidx.test.espresso.ViewInteraction;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObjectNotFoundException;
import androidx.test.uiautomator.UiSelector;

import com.quickpick.LoginActivity;
import com.quickpick.R;

import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withParent;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static androidx.test.platform.app.InstrumentationRegistry.getInstrumentation;
import static com.quickpick.login.LoginUtils.checkWelcomeTextIsDisplayed;

@RunWith(AndroidJUnit4.class)
public class LoginTestCase {

    @Rule
    public ActivityScenarioRule<LoginActivity> mActivityTestRule = new ActivityScenarioRule<>(LoginActivity.class);

    @LargeTest
    @Test
    public void notLoggedInTestCase() {
        UiDevice device = UiDevice.getInstance(getInstrumentation());

        ViewInteraction facebookLoginButton = onView(
                Matchers.allOf(ViewMatchers.withId(R.id.login_button), withText("Continue with Facebook"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        // Login button should prompt login at beginning
        facebookLoginButton.check(matches(isDisplayed()));

        // login and then press back
        facebookLoginButton.perform(click());
        device.pressBack();
        facebookLoginButton.check(matches(isDisplayed()));

        // login and then press cancel
        facebookLoginButton.perform(click());
        try {
            device.findObject(new UiSelector().text("Cancel")).click();
        } catch (UiObjectNotFoundException e) {
            Assert.assertFalse("Cancel Button not found", false);
        }
        facebookLoginButton.check(matches(isDisplayed()));

        // login and then press X
        facebookLoginButton.perform(click());
        try {
            device.findObject(new UiSelector().description("Close tab")).click();
        } catch (UiObjectNotFoundException e) {
            Assert.assertFalse("Close tab button not found", false);
        }
        facebookLoginButton.check(matches(isDisplayed()));

        // login and then press Continue
        facebookLoginButton.perform(click());
        try {
            device.findObject(new UiSelector().text("Continue")).click();
        } catch (UiObjectNotFoundException e) {
            Assert.assertFalse("Continue button not found", false);
        }

        checkWelcomeTextIsDisplayed();
    }

}
