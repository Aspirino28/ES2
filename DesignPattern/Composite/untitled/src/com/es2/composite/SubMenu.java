package com.es2.composite;
import java.util.ArrayList;

public class SubMenu extends Menu {
    private ArrayList<Menu> elements = new ArrayList<>();

    @Override
    public void showOptions() {
        if (this.label != null) {
            System.out.println(this.label);
        }

        for (Menu item : elements) {
            item.showOptions();
        }
    }

    public void addChild(Menu element) {
        elements.add(element);
    }
}