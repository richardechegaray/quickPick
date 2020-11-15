package com.quickpick.login;

import androidx.test.espresso.ViewInteraction;
import androidx.test.espresso.matcher.ViewMatchers;

import com.quickpick.R;

import org.hamcrest.Matchers;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withText;


public class LoginUtils {

    public static void checkWelcomeTextIsDisplayed() {
        // wait for automatic navigation to Main Activity
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        ViewInteraction textView = onView(
                Matchers.allOf(ViewMatchers.withId(R.id.welcome_text), withText(R.string.welcome_message),
                        isDisplayed()));
        textView.check(matches(withText(R.string.welcome_message)));
    }

}
