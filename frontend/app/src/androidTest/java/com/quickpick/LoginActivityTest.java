package com.quickpick;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObjectNotFoundException;
import androidx.test.uiautomator.UiSelector;

import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static androidx.test.platform.app.InstrumentationRegistry.getInstrumentation;

@RunWith(AndroidJUnit4.class)
public class LoginActivityTest {

    @Rule
    public ActivityScenarioRule<LoginActivity> activityRule = new ActivityScenarioRule<>(LoginActivity.class);

    @Test
    public void loginButtonIsVisible() {
        onView(withId(R.id.login_button)).check(matches(isDisplayed()));
    }

    @Test
    public void loginButtonHasRightText() {
        checkButtonTextPromptsLogin();
    }

    @Test
    public void cancelLoginByPressingBack() {
        UiDevice device = UiDevice.getInstance(getInstrumentation());
        onView(withId(R.id.login_button)).perform(click());
        device.pressBack();
        checkButtonTextPromptsLogin();
    }

    @Test
    public void cancelLoginByPressingCancel() {
        UiDevice device = UiDevice.getInstance(getInstrumentation());
        onView(withId(R.id.login_button)).perform(click());
        try {
            device.findObject(new UiSelector().text("Cancel")).click();
        } catch (UiObjectNotFoundException e) {
            Assert.assertFalse("Cancel Button not found", false);
        }
        checkButtonTextPromptsLogin();
    }

    @Test
    public void cancelLoginByPressingX() {
        UiDevice device = UiDevice.getInstance(getInstrumentation());
        onView(withId(R.id.login_button)).perform(click());
        try {
            device.findObject(new UiSelector().description("Close tab")).click();
        } catch (UiObjectNotFoundException e) {
            Assert.assertFalse("Close tab button not found", false);
        }
        checkButtonTextPromptsLogin();
    }

    private void checkButtonTextPromptsLogin() {
        onView(withId(R.id.login_button)).check(matches(withText("Continue with Facebook")));
    }

}
