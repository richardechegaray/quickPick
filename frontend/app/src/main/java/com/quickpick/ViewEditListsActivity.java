package com.quickpick;

import android.content.Intent;
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

import com.facebook.AccessToken;
import com.quickpick.payloads.ListPayload;
import com.quickpick.repositories.ListRepository;
import com.quickpick.repositories.RunnableUtils;
import com.quickpick.viewmodels.ListViewModel;

import java.util.ArrayList;
import java.util.List;

public class ViewEditListsActivity extends AppCompatActivity {

    private ListPayloadAdapter adapter;

    private AccessToken accessToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_edit_lists);

        accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken == null || accessToken.isExpired()) {
            startActivity(new Intent(getBaseContext(), LoginActivity.class));
            finish();
            return;
        }

        setUpRecyclerView();
        ListViewModel viewModel = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(ListViewModel.class);
        viewModel.getLists().observe(this, newListOfLists -> {
            adapter.updateLists(newListOfLists.getLists());
            adapter.notifyDataSetChanged();
        });
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

    private class ListPayloadAdapter extends RecyclerView.Adapter<ListPayloadAdapter.ListPayloadViewHolder> {
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
            holder.setPosition(position);
        }

        private void deleteList(int position) {
            ListRepository.getInstance().callDeleteList(
                    () -> ListRepository.getInstance().callGetLists(
                            RunnableUtils.DO_NOTHING,
                            RunnableUtils.showToast(ViewEditListsActivity.this, getString(R.string.get_lists_failed)),
                            accessToken.getToken()),
                    RunnableUtils.showToast(ViewEditListsActivity.this, getString(R.string.delete_list_failed)),
                    accessToken.getToken(),
                    lists.get(position).getId());
        }

        @Override
        public int getItemCount() {
            return lists.size();
        }

        private class ListPayloadViewHolder extends RecyclerView.ViewHolder {
            private final TextView textView;

            private int position;

            public ListPayloadViewHolder(@NonNull View view) {
                super(view);
                this.textView = view.findViewById(R.id.list_name_text_view);
                this.position = 0;
                view.findViewById(R.id.list_delete_button).setOnClickListener(button -> deleteList(position));
            }

            private void setPosition(int position) {
                this.position = position;
            }
        }
    }
}