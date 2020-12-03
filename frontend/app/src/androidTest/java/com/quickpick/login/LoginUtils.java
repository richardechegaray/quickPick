package com.quickpick.login;

import androidx.test.espresso.ViewInteraction;
import androidx.test.espresso.matcher.ViewMatchers;

import com.quickpick.R;

import org.hamcrest.Matchers;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;


public class LoginUtils {

    public static void checkWelcomeTextIsDisplayed() {
        // wait for automatic navigation to Main Activity
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        ViewInteraction textView = onView(
                Matchers.allOf(ViewMatchers.withId(R.id.welcome_text),
                        isDisplayed()));
        textView.check(matches(ViewMatchers.withId(R.id.welcome_text)));
    }

}
