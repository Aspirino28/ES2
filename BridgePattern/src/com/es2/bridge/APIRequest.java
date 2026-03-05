package com.es2.bridge;

import java.util.HashMap;
import java.util.Map;


public class APIRequest {

    protected Map<String, APIServiceInterface> services;

    public APIRequest() {
        this.services = new HashMap<>();
    }


    public String addService(APIServiceInterface service) {
        String serviceId = String.valueOf(services.size() + 1);
        services.put(serviceId, service);
        return serviceId;
    }


    public String getContent(String serviceId, String contentId) throws ServiceNotFoundException {
        APIServiceInterface service = services.get(serviceId);
        if (service != null) {
            return service.getContent(contentId);
        } else {
            throw new ServiceNotFoundException();
        }
    }


    public String setContent(String serviceId, String content) throws ServiceNotFoundException {
        APIServiceInterface service = services.get(serviceId);
        if (service != null) {
            return service.setContent(content);
        } else {
            throw new ServiceNotFoundException();
        }
    }
}