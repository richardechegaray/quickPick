package com.quickpick.activities;

import android.content.IntentFilter;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.ViewModelProvider;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.bumptech.glide.Glide;
import com.quickpick.MyFirebaseMessagingService;
import com.quickpick.R;
import com.quickpick.payloads.ResultPayload;
import com.quickpick.payloads.SessionPayload;
import com.quickpick.receivers.FirebaseIntentReceiver;
import com.quickpick.repositories.SessionRepository;
import com.quickpick.viewmodels.SessionViewModel;

import java.util.List;

public class SummaryActivity extends AppCompatActivity {

    private FirebaseIntentReceiver<SessionPayload> receiver;

    private ImageView firstPlaceImage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_summary);

        firstPlaceImage = findViewById(R.id.first_place_image);
        findViewById(R.id.return_to_main_activity_button).setOnClickListener(
                view -> finish()
        );

        receiver = new FirebaseIntentReceiver<>(FirebaseIntentReceiver.SESSION_RECEIVER_TAG, SessionPayload.INTENT_KEY);

        SessionViewModel model = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(SessionViewModel.class);

        model.getSession().observe(this, newSession -> {
            if ("complete".equals(newSession.getStatus())) {
                showResults(newSession.getResults());
            } else {
                firstPlaceImage.setImageDrawable(ContextCompat.getDrawable(this, R.drawable.ic_waiting_for_results));
                firstPlaceImage.setScaleType(ImageView.ScaleType.FIT_CENTER);
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        LocalBroadcastManager.getInstance(this).registerReceiver(receiver, new IntentFilter(MyFirebaseMessagingService.SESSION_INTENT_ACTION));
        SessionRepository.getInstance().addSessionSource(receiver.getData());
    }

    @Override
    protected void onStop() {
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(receiver);
        SessionRepository.getInstance().removeSessionSource(receiver.getData());
    }

    private void showResults(List<ResultPayload> results) {
        firstPlaceImage.setScaleType(ImageView.ScaleType.CENTER_CROP);
        if (results.size() > 0) {
            ResultPayload firstPlace = results.get(0);

            Glide.with(getApplicationContext()).load(firstPlace.getIdea().getPicture())
                    .into(firstPlaceImage);
            ((TextView) findViewById(R.id.first_place_idea_text)).setText(firstPlace.getIdea().getName());
            ((TextView) findViewById(R.id.first_place_description)).setText(firstPlace.getIdea().getDescription());
            ((TextView) findViewById(R.id.first_place_idea_score)).setText(String.valueOf(firstPlace.getScore()));

            if (results.size() > 1) {
                ResultPayload secondPlace = results.get(1);

                ((TextView) findViewById(R.id.second_place_idea)).setText(secondPlace.getIdea().getName());
                ((TextView) findViewById(R.id.second_place_idea_description)).setText(secondPlace.getIdea().getDescription());
                ((TextView) findViewById(R.id.second_place_idea_score)).setText(String.valueOf(secondPlace.getScore()));

                if (results.size() > 2) {
                    ResultPayload thirdPlace = results.get(2);

                    ((TextView) findViewById(R.id.third_place_idea)).setText(thirdPlace.getIdea().getName());
                    ((TextView) findViewById(R.id.third_place_idea_description)).setText(thirdPlace.getIdea().getDescription());
                    ((TextView) findViewById(R.id.third_place_idea_score)).setText(String.valueOf(thirdPlace.getScore()));
                }
            }
        } else {
            String noResultsFoundUrl = "https://cdn.dribbble.com/users/1242216/screenshots/9326781/media/6384fef8088782664310666d3b7d4bf2.png";
            Glide.with(getApplicationContext()).load(noResultsFoundUrl)
                    .into(firstPlaceImage);
            ((TextView) findViewById(R.id.first_place_idea_text)).setText(R.string.no_results_found_text);
            ((TextView) findViewById(R.id.first_place_idea_score)).setText("");
        }
    }
}