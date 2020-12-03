package com.quickpick.session;


import android.view.View;

import androidx.test.espresso.ViewInteraction;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;

import com.quickpick.R;
import com.quickpick.activities.MainActivity;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.RootMatchers.withDecorView;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.not;

@RunWith(AndroidJUnit4.class)
public class JoinSessionInvalidTestCase {

    @Rule
    public ActivityScenarioRule<MainActivity> mActivityTestRule = new ActivityScenarioRule<>(MainActivity.class);

    private View decorView;

    @Before
    public void retrieveDecorView() {
        mActivityTestRule.getScenario().onActivity(activity -> decorView = activity.getWindow().getDecorView());
    }

    @LargeTest
    @Test
    public void joinSessionInvalidTestCase() {
        ViewInteraction joinSessionButton = onView(
                allOf(withId(R.id.join_session_button),
                        isDisplayed()));
        // Logged in user should see button to join session
        joinSessionButton.check(matches(isDisplayed()));

        // Pressing "Join Session" button should open prompt
        joinSessionButton.perform(click());
        sleep(1000);
        onView(withText(R.string.enter_session_id_title)).inRoot(withDecorView(not(decorView))).check(matches(isDisplayed()));

        // Pressing "Cancel" in prompt should return back to original screen
        onView(allOf(withId(R.id.dialog_cancel_button), withText(R.string.dialog_cancel_button_text),
                isDisplayed())).perform(click());
        sleep(1000);
        joinSessionButton.check(matches(isDisplayed()));

        // Joining with an empty code should return back to original screen and show error toast
        joinSessionButton.perform(click());
        ViewInteraction joinButton = onView(
                allOf(withId(R.id.dialog_join_button), withText(R.string.dialog_join_button_text),
                        isDisplayed()));
        joinButton.perform(click());
        onView(withText("Invalid code")).inRoot(withDecorView(not(decorView))).check(matches(isDisplayed()));
        joinSessionButton.check(matches(isDisplayed()));

        // Joining with an empty code should return back to original screen and show error toast
        joinSessionButton.perform(click());
        ViewInteraction textInputEditText = onView(
                allOf(withId(R.id.session_code_edit_text),
                        isDisplayed()));
        textInputEditText.perform(replaceText("invalid code"), closeSoftKeyboard());
        joinButton.perform(click());
        onView(withText("Invalid code")).inRoot(withDecorView(not(decorView))).check(matches(isDisplayed()));
        joinSessionButton.check(matches(isDisplayed()));

        // Joining a valid session
        joinSessionButton.perform(click());
        textInputEditText.perform(replaceText("5UthG"), closeSoftKeyboard());
        joinButton.perform(click());
        sleep(1000);
        onView(withId(R.id.session_key_text)).check(matches(isDisplayed()));
    }

    private void sleep(int time) {
        try {
            Thread.sleep(time);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }

}
