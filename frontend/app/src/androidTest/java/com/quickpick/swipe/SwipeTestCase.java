package com.quickpick.swipe;


import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.test.espresso.DataInteraction;
import androidx.test.espresso.ViewAction;
import androidx.test.espresso.ViewInteraction;
import androidx.test.espresso.action.GeneralLocation;
import androidx.test.espresso.action.GeneralSwipeAction;
import androidx.test.espresso.action.Press;
import androidx.test.espresso.action.Swipe;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;

import com.quickpick.MainActivity;
import com.quickpick.R;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onData;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withContentDescription;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.anything;
import static org.hamcrest.Matchers.is;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class SwipeTestCase {

    @Rule
    public ActivityScenarioRule<MainActivity> mActivityTestRule = new ActivityScenarioRule<>(MainActivity.class);

    @LargeTest
    @Test
    public void swipeTest() { //starts at main activity
        startMovieSession();

        testSwipes();
    }

    private void startMovieSession() {
        // create session
        ViewInteraction createSessionButton = onView(
                allOf(withId(R.id.create_session_button), withText("Create Session"),
                        isDisplayed()));
        createSessionButton.perform(click());

        sleep(1000);

        // selects option button
        ViewInteraction selectListButton = onView(
                allOf(withId(R.id.session_list_edit_text),
                        isDisplayed()));
        selectListButton.perform(click());

        sleep(1000);

        // selects movie genre
        DataInteraction movieOptionButton = onData(anything())
                .inAdapterView(allOf(withId(R.id.select_dialog_listview),
                        childAtPosition(
                                withId(R.id.contentPanel),
                                0)))
                .atPosition(1);
        movieOptionButton.perform(click());

        sleep(1000);

        // selects done button
        ViewInteraction confirmListButton = onView(
                allOf(withId(android.R.id.button1), withText("Select"),
                        childAtPosition(
                                childAtPosition(
                                        withId(R.id.buttonPanel),
                                        0),
                                3)));
        confirmListButton.perform(scrollTo(), click());

        sleep(1000);

    }

    private void testSwipes() {
        // starts swiping
        ViewInteraction startSwipingButton = onView(
                allOf(withId(R.id.start_swiping_button), withText("Start Swiping!"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                0),
                        isDisplayed()));
        startSwipingButton.perform(click());

        sleep(1000);

        // like button
        ViewInteraction likeButton = onView(
                allOf(withId(R.id.likeButton), withContentDescription("like button"),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.FrameLayout")),
                                        0),
                                1),
                        isDisplayed()));
        likeButton.perform(click());

        sleep(1000);

        // dislike button
        ViewInteraction dislikeButton = onView(
                allOf(withId(R.id.dislikeButton), withContentDescription("dislike button"),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.FrameLayout")),
                                        0),
                                0),
                        isDisplayed()));
        dislikeButton.perform(click());

        sleep(1000);

        // swiping tests, left and right
        onView(withIndex(withId(R.id.card_view), 0)).perform(swipeLeft());
        for (int i = 0; i < 3; i++) {
            sleep(1000);
            onView(withIndex(withId(R.id.card_view), 0)).perform(swipeLeft());
            sleep(1000);
            onView(withIndex(withId(R.id.card_view), 0)).perform(swipeRight());
        }

        sleep(1000);

        // expect to see top three choices and return to main menu button
        onView(withText("Horror")).check(matches(isDisplayed()));
        onView(withText("Sci-Fi")).check(matches(isDisplayed()));
        onView(withText("Musical")).check(matches(isDisplayed()));
        onView(withText("Return to Main Menu")).check(matches(isDisplayed()));

        ViewInteraction returnToMainMenuButton = onView(
                allOf(withId(R.id.return_to_main_activity_button), withText("Return to Main Menu"),
                        childAtPosition(
                                childAtPosition( // error here
                                        withId(android.R.id.content),
                                        0),
                                3),
                        isDisplayed()));
        returnToMainMenuButton.perform(click());
    }


    private static ViewAction swipeRight() {
        return new GeneralSwipeAction(Swipe.FAST, GeneralLocation.CENTER_LEFT,
                GeneralLocation.CENTER_RIGHT, Press.FINGER);
    }

    private static ViewAction swipeLeft() {
        return new GeneralSwipeAction(Swipe.FAST, GeneralLocation.CENTER_RIGHT,
                GeneralLocation.CENTER_LEFT, Press.FINGER);
    }

    private static void sleep(int time) {
        try {
            Thread.sleep(time);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private static Matcher<View> withIndex(final Matcher<View> matcher, final int index) {
        return new TypeSafeMatcher<View>() {
            int currentIndex = 0;

            @Override
            public void describeTo(Description description) {
                description.appendText("with index: ");
                description.appendValue(index);
                matcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                return matcher.matches(view) && currentIndex++ == index;
            }
        };
    }

    private static Matcher<View> childAtPosition(
            final Matcher<View> parentMatcher, final int position) {

        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("Child at position " + position + " in parent ");
                parentMatcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                ViewParent parent = view.getParent();
                return parent instanceof ViewGroup && parentMatcher.matches(parent)
                        && view.equals(((ViewGroup) parent).getChildAt(position));
            }
        };
    }
}
