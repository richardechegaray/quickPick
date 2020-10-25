package com.quickpick;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.mindorks.placeholderview.SwipeDecor;
import com.mindorks.placeholderview.SwipePlaceHolderView;
import com.mindorks.placeholderview.listeners.ItemRemovedListener;
import com.quickpick.payloads.IdeaPayload;
import com.quickpick.viewmodels.IdeaCard;
import com.quickpick.viewmodels.SessionViewModel;

public class SwipeActivity extends AppCompatActivity {

    private SwipePlaceHolderView mSwipeView;
    private Context mContext;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_swipe);

        mSwipeView = (SwipePlaceHolderView)findViewById(R.id.swipeView);
        mContext = getApplicationContext();

        mSwipeView.getBuilder()
                .setDisplayViewCount(3)
                .setSwipeDecor(new SwipeDecor()
                        .setPaddingTop(20)
                        .setRelativeScale(0.01f)
                        .setSwipeInMsgLayoutId(R.layout.swipe_in_msg_view)
                        .setSwipeOutMsgLayoutId(R.layout.swipe_out_msg_view));

        SessionViewModel model = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(SessionViewModel.class);

        for(IdeaPayload idea : model.getSession().getValue().getList().getIdeas()){ //looping through all of our ideas
            mSwipeView.addView(new IdeaCard(idea, mContext, mSwipeView));
        }

        findViewById(R.id.dislikeButton).setOnClickListener(view -> mSwipeView.doSwipe(false));

        findViewById(R.id.likeButton).setOnClickListener(view -> mSwipeView.doSwipe(true));

        mSwipeView.addItemRemoveListener(count -> {
            if (count == 0) {
                // TODO: send post request
                startActivity(new Intent(getApplicationContext(), SummaryActivity.class)
                        .addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY));
            }
        });


    }
}
