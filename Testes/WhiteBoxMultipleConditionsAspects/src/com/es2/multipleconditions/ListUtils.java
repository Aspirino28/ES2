package com.es2.multipleconditions;

import java.util.ArrayList;

public class ListUtils {
    public static int findName(ArrayList<String> list, String name) {
        int i = 0;
        while (i < list.size()) {
            if (list.get(i).equals(name)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}
