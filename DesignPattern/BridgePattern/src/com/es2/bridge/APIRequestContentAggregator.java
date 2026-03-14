package com.es2.bridge;


public class APIRequestContentAggregator extends APIRequest {

    public APIRequestContentAggregator() {
        super();
    }


    @Override
    public String getContent(String serviceId, String contentId) throws ServiceNotFoundException {
        APIServiceInterface service = services.get(serviceId);
        if (service != null) {
            String aggregatedContent = service.getContent("0"); // Retorna todos os conteúdos concatenados.
            return aggregatedContent;
        } else {
            throw new ServiceNotFoundException();
        }
    }
}