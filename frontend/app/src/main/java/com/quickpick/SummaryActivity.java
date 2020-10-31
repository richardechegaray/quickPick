package com.quickpick;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.bumptech.glide.Glide;
import com.quickpick.payloads.ResultPayload;
import com.quickpick.receivers.SessionReceiver;
import com.quickpick.repositories.SessionRepository;
import com.quickpick.viewmodels.SessionViewModel;

import java.util.List;

public class SummaryActivity extends AppCompatActivity {

    private SessionReceiver receiver;
    private Button returnToMainMenu;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_summary);

        returnToMainMenu = findViewById(R.id.return_to_main_activity_button);
        returnToMainMenu.setOnClickListener(view ->
                startActivity(new Intent(getApplicationContext(), MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK))
        );


        receiver = new SessionReceiver();

        SessionViewModel model = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(SessionViewModel.class);

        model.getSession().observe(this, newSession -> {
            List<ResultPayload> results = newSession.getResults();

            if (results.size() > 0) {
                ResultPayload firstPlace = results.get(0);

                Glide.with(getApplicationContext()).load(firstPlace.getIdea().getPicture())
                        .into((ImageView) findViewById(R.id.first_place_image));
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
                String waitingForResults = "https://lh3.googleusercontent.com/proxy/F5ZtRqXgWb9lreOCddeHo5DHts4A9LBJ1PxS7XjedRnSWT3gcCDpxFj8OPG6Gyh-vqdZWyRWdqTSj7lQRQvZkJpAB_D68MNQFRsL-wkodvvoltKqW-O2bfjZiX3lWleJ";
                String waitingForResultText = "Waiting for results ...";
                Glide.with(getApplicationContext()).load(waitingForResults)
                        .into((ImageView) findViewById(R.id.first_place_image));
                ((TextView) findViewById(R.id.first_place_idea_text)).setText(waitingForResultText);
                ((TextView) findViewById(R.id.first_place_idea_score)).setText("");
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        LocalBroadcastManager.getInstance(this).registerReceiver(receiver, new IntentFilter(MyFirebaseMessagingService.SESSION_INTENT));
        SessionRepository.getInstance().addSessionSource(receiver.getSession());
    }

    @Override
    protected void onStop() {
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(receiver);
        SessionRepository.getInstance().removeSessionSource(receiver.getSession());
    }

}