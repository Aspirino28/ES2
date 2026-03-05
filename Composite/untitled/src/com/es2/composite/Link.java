package com.es2.composite;

public class Link extends Menu {
    private String url;

    public void setURL(String url) {
        this.url = url;
    }

    public String getURL() {
        return url;
    }

    @Override
    public void showOptions() {
        if (this.label != null) {
            System.out.println(this.label);
        }
        if (this.url != null) {
            System.out.println(this.url);
        }
    }
}