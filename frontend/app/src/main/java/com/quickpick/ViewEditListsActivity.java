package com.quickpick;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.quickpick.payloads.ListPayload;
import com.quickpick.viewmodels.ListViewModel;

import java.util.ArrayList;
import java.util.List;

public class ViewEditListsActivity extends AppCompatActivity {

    private ListPayloadAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_edit_lists);

        setUpRecyclerView();
        ListViewModel viewModel = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(ListViewModel.class);
        viewModel.getLists().observe(this, newListOfLists -> adapter.updateLists(newListOfLists.getLists()));
    }

    private void setUpRecyclerView() {
        RecyclerView recyclerView = findViewById(R.id.list_recycler_view);
        recyclerView.setHasFixedSize(true);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.addItemDecoration(new DividerItemDecoration(recyclerView.getContext(),
                layoutManager.getOrientation()));
        adapter = new ListPayloadAdapter(new ArrayList<>());
        recyclerView.setAdapter(adapter);
    }

    private static class ListPayloadAdapter extends RecyclerView.Adapter<ListPayloadAdapter.ListPayloadViewHolder> {
        private List<ListPayload> lists;

        private ListPayloadAdapter(List<ListPayload> lists) {
            this.lists = lists;
        }

        public void updateLists(List<ListPayload> newLists) {
            this.lists = newLists;
        }

        @NonNull
        @Override
        public ListPayloadViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.recycler_view_list, parent, false);
            return new ListPayloadViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ListPayloadViewHolder holder, int position) {
            String userName = lists.get(position).getName();
            holder.textView.setText(userName);
        }

        @Override
        public int getItemCount() {
            return lists.size();
        }

        private static class ListPayloadViewHolder extends RecyclerView.ViewHolder {
            public TextView textView;

            public ListPayloadViewHolder(@NonNull View view) {
                super(view);
                this.textView = view.findViewById(R.id.list_name_text_view);
            }
        }
    }
}