package com.iting.jobportal.auth.service;

import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class GoogleAuthService {

  public Map<String, Object> getUserInfo(String accessToken) throws IOException {
    NetHttpTransport transport = new NetHttpTransport();
    GsonFactory jsonFactory = new GsonFactory();

    var requestFactory =
        transport.createRequestFactory(
            request -> {
              request.setParser(new JsonObjectParser(jsonFactory));
            });

    HttpRequest request =
        requestFactory.buildGetRequest(
            new GenericUrl(
                "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken));

    return request.execute().parseAs(Map.class);
  }
}
