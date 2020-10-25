package com.quickpick.viewmodels;

import android.content.Context;
import android.util.Log;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.mindorks.placeholderview.SwipePlaceHolderView;
import com.mindorks.placeholderview.annotations.Layout;
import com.mindorks.placeholderview.annotations.Resolve;
import com.mindorks.placeholderview.annotations.View;
import com.mindorks.placeholderview.annotations.swipe.SwipeCancelState;
import com.mindorks.placeholderview.annotations.swipe.SwipeIn;
import com.mindorks.placeholderview.annotations.swipe.SwipeInState;
import com.mindorks.placeholderview.annotations.swipe.SwipeOut;
import com.mindorks.placeholderview.annotations.swipe.SwipeOutState;
import com.quickpick.R;
import com.quickpick.payloads.IdeaPayload;

@Layout(R.layout.swipe_card_view)
public class IdeaCard {

    @View(R.id.ideaImage)
    private ImageView ideaImage;

    @View(R.id.ideaText)
    private TextView ideaText;

    @View(R.id.ideaDescriptionText)
    private TextView ideaDescriptionText;

    private Context mContext;
    private IdeaPayload mIdea;
    private SwipePlaceHolderView mSwipeView;

    public IdeaCard(IdeaPayload idea, Context context, SwipePlaceHolderView swipeView) {
        mContext = context;
        mIdea = idea;
        mSwipeView = swipeView;
    }

    @Resolve
    private void onResolved() {
        Glide.with(mContext).load(mIdea.getImageUrl()).into(ideaImage);
        ideaText.setText(mIdea.getName());
        ideaDescriptionText.setText(mIdea.getDescription());
    }

    @SwipeOut
    private void onSwipedOut(){ //left swipe == accept
        Log.d("EVENT", "onSwipedOut");
    }

    @SwipeCancelState
    private void onSwipeCancelState(){
        Log.d("EVENT", "onSwipeCancelState");
    }

    @SwipeIn
    private void onSwipeIn(){ //right swipe
        Log.d("EVENT", "onSwipedIn");
    }

    @SwipeInState
    private void onSwipeInState(){
        Log.d("EVENT", "onSwipeInState");
    }

    @SwipeOutState
    private void onSwipeOutState(){
        Log.d("EVENT", "onSwipeOutState");
    }
}
