package com.quickpick;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.textfield.TextInputEditText;
import com.quickpick.payloads.IdeaPayload;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

class MyRecyclerViewAdapter extends RecyclerView.Adapter<MyRecyclerViewAdapter.ViewHolder> {

    private final List<IdeaPayload> mData;
    private final LayoutInflater mInflater;

    private final Set<ViewHolder> boundedViewHolders;

    // data is passed into the constructor
    MyRecyclerViewAdapter(Context context, List<IdeaPayload> data) {
        this.mInflater = LayoutInflater.from(context);
        this.boundedViewHolders = new HashSet<>();
        this.mData = new ArrayList<>();
        // Do a deep copy just in case
        for (IdeaPayload payload : data) {
            mData.add(new IdeaPayload(payload));
        }
    }

    // inflates the row layout from xml when needed
    @Override
    @NonNull
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = mInflater.inflate(R.layout.recycler_view_entries, parent, false);
        return new ViewHolder(view);
    }

    // binds the data to the TextView in each row
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        holder.onBind(mData.get(position), position);
        boundedViewHolders.add(holder);
    }

    @Override
    public void onViewRecycled(@NonNull ViewHolder holder) {
        // write the data in the EditText back when recycled
        super.onViewRecycled(holder);
        holder.updateIdeaPayload();
        boundedViewHolders.remove(holder);
    }

    void addNewListEntry() {
        mData.add(new IdeaPayload());
        notifyDataSetChanged();
    }

    private void deleteListEntry(int position) {
        mData.remove(position);
        notifyDataSetChanged();
    }

    List<IdeaPayload> getListEntries() {
        boundedViewHolders.forEach(ViewHolder::updateIdeaPayload);
        List<IdeaPayload> entries = new ArrayList<>();
        for (IdeaPayload payload : mData) { // deep copy
            entries.add(new IdeaPayload(payload));
        }
        return entries;
    }


    // total number of rows
    @Override
    public int getItemCount() {
        return mData.size();
    }

    // stores and recycles views as they are scrolled off screen
    class ViewHolder extends RecyclerView.ViewHolder {
        private final EditText name;
        private final EditText description;

        private int position;

        private IdeaPayload idea;

        private ViewHolder(View itemView) {
            super(itemView);
            position = 0;
            idea = null;
            name = (TextInputEditText) itemView.findViewById(R.id.rv_entry);
            description = (TextInputEditText) itemView.findViewById(R.id.rv_description);
            itemView.findViewById(R.id.rv_entries_delete_button).setOnClickListener(view ->
                    deleteListEntry(position)
            );
        }

        private void onBind(IdeaPayload idea, int position) {
            this.idea = idea;
            this.position = position;
            name.setText(idea.getName());
            description.setText(idea.getDescription());

        }

        private void updateIdeaPayload() {
            idea.setName(name.getText().toString());
            idea.setDescription(description.getText().toString());
        }
    }

}