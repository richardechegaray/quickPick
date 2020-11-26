package com.quickpick;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.textfield.TextInputEditText;
import com.quickpick.payloads.IdeaPayload;

import java.util.HashMap;
import java.util.List;

class MyRecyclerViewAdapter extends RecyclerView.Adapter<MyRecyclerViewAdapter.ViewHolder> {

    private List<IdeaPayload> mData;
    private HashMap<Button, IdeaPayload> buttonHm;
    private LayoutInflater mInflater;
    private ItemClickListener mClickListener;

    // data is passed into the constructor
    MyRecyclerViewAdapter(Context context, List<IdeaPayload> data, HashMap<Button, IdeaPayload> hm) {
        this.mInflater = LayoutInflater.from(context);
        this.mData = data;
        this.buttonHm = hm;
    }

    // inflates the row layout from xml when needed
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = mInflater.inflate(R.layout.recycler_view_entries, parent, false);
        return new ViewHolder(view);
    }

    // binds the data to the TextView in each row
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        String entry = mData.get(position).getName();
        String description = mData.get(position).getDescription();
        holder.myEntry.setText(entry);
        holder.myEntry.setText(description);
    }

    // total number of rows
    @Override
    public int getItemCount() {
        return mData.size();
    }

    // stores and recycles views as they are scrolled off screen
    class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
        EditText myEntry;

        EditText myDescription;

        Button myButton;

        ViewHolder(View itemView) {
            super(itemView);
            myEntry = (TextInputEditText) itemView.findViewById(R.id.rv_entry);
            myDescription = (TextInputEditText) itemView.findViewById(R.id.rv_description);
            myButton = itemView.findViewById(R.id.rv_entries_delete_button);
//            itemView.setOnClickListener(this);
            IdeaPayload myIdea = new IdeaPayload(myEntry.toString(), myDescription.toString());
//            mData.add(myIdea);
            for (IdeaPayload idea : mData) {
                if (myIdea.equals(idea)) {
                    myIdea = idea;
                    break;
                }
            }
            buttonHm.put(myButton, myIdea);
            myButton.setOnClickListener(view -> {
                mData.remove(buttonHm.get(myButton));
                buttonHm.remove(myButton);
                notifyDataSetChanged();
            });
        }

        @Override
        public void onClick(View view) {
            if (mClickListener != null) mClickListener.onItemClick(view, getAdapterPosition());
        }

        EditText getMyEntry() {
            return myEntry;
        }

        EditText getMyDescription() {
            return  myDescription;
        }
    }

    // convenience method for getting data at click position
    IdeaPayload getItem(int id) {
        return mData.get(id);
    }

    void add(IdeaPayload idea) {
        mData.add(idea);
        notifyDataSetChanged();
    }


    // allows clicks events to be caught
    void setClickListener(ItemClickListener itemClickListener) {
        this.mClickListener = itemClickListener;
    }

    // parent activity will implement this method to respond to click events
    public interface ItemClickListener {
        void onItemClick(View view, int position);
    }
}