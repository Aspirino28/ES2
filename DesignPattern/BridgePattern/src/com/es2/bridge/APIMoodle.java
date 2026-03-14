package com.es2.bridge;

import java.util.LinkedHashMap;
import java.util.Map;

public class APIMoodle implements APIServiceInterface {

    protected Map<String, String> content;

    public APIMoodle() {
        this.content = new LinkedHashMap<>();
    }

    @Override
    public String getContent(String contentId) {
        if (contentId.equals("0")) {
            StringBuilder allContent = new StringBuilder();
            for (Map.Entry<String, String> entry : content.entrySet()) {
                allContent.append(entry.getValue());
            }
            return allContent.toString();
        } else {
            return content.get(contentId);
        }
    }

    @Override
    public String setContent(String contentValue) {
        String contentId = String.valueOf(content.size() + 1);
        content.put(contentId, contentValue);
        return contentId;
    }
}