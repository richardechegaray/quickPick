package com.quickpick.activities;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.facebook.AccessToken;
import com.mindorks.placeholderview.SwipeDecor;
import com.mindorks.placeholderview.SwipePlaceHolderView;
import com.quickpick.R;
import com.quickpick.payloads.ChoicePayload;
import com.quickpick.payloads.IdeaPayload;
import com.quickpick.repositories.SessionRepository;
import com.quickpick.viewmodels.IdeaCard;
import com.quickpick.viewmodels.ListViewModel;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class SwipeActivity extends AppCompatActivity {

    private String facebookAccessToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_swipe);

        AccessToken accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken == null || accessToken.isExpired()) {
            startActivity(new Intent(getBaseContext(), LoginActivity.class));
            return;
        }
        facebookAccessToken = accessToken.getToken();

        setUpSwipeView();
    }

    private void setUpSwipeView() {
        SwipePlaceHolderView mSwipeView = findViewById(R.id.swipeView);
        ArrayList<IdeaCard> ideaList = new ArrayList<>();

        mSwipeView.getBuilder()
                .setDisplayViewCount(3)
                .setSwipeDecor(new SwipeDecor()
                        .setPaddingTop(20)
                        .setRelativeScale(0.01f)
                        .setSwipeInMsgLayoutId(R.layout.swipe_in_msg_view)
                        .setSwipeOutMsgLayoutId(R.layout.swipe_out_msg_view));

        ListViewModel model = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(ListViewModel.class);
        addCardsToView(model.getSessionList().getValue().getIdeas(), ideaList, mSwipeView);

        findViewById(R.id.dislikeButton).setOnClickListener(view -> mSwipeView.doSwipe(false));
        findViewById(R.id.likeButton).setOnClickListener(view -> mSwipeView.doSwipe(true));

        mSwipeView.addItemRemoveListener(count -> {
            if (count == 0) {
                List<ChoicePayload> choices = ideaList.stream().map(IdeaCard::getChoice).collect(Collectors.toList());
                SessionRepository.getInstance().postChoices(() -> {
                }, facebookAccessToken, choices);
                startActivity(new Intent(getApplicationContext(), SummaryActivity.class)
                        .addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY));
            }
        });
    }

    private void addCardsToView(List<IdeaPayload> ideas, ArrayList<IdeaCard> ideaList, SwipePlaceHolderView mSwipeView) {
        Context mContext = getApplicationContext();
        for (IdeaPayload idea : ideas) {
            IdeaCard ideaCard = new IdeaCard(idea, mContext);
            ideaList.add(ideaCard);
            mSwipeView.addView(ideaCard);
        }
    }
}
