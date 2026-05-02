package com.iting.jobportal.file;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.ByteArrayInputStream;
import java.net.URL;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class S3FileUploadServiceImplTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    @Mock
    private PresignedGetObjectRequest presignedGetObjectRequest;

    @InjectMocks
    private S3FileUploadServiceImpl service;

    @Test
    void uploadAvatar_shouldPutObjectAndReturnPublicUrl() throws Exception {
        MultipartFile file = org.mockito.Mockito.mock(MultipartFile.class);
        ReflectionTestUtils.setField(service, "bucket", "my-bucket");
        ReflectionTestUtils.setField(service, "region", "ap-southeast-1");

        when(file.getOriginalFilename()).thenReturn("avatar.png");
        when(file.getContentType()).thenReturn("image/png");
        when(file.getSize()).thenReturn(3L);
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream("abc".getBytes()));

        String url = service.uploadAvatar(file);

        assertEquals(true, url.startsWith("https://my-bucket.s3.ap-southeast-1.amazonaws.com/avatar/"));
        ArgumentCaptor<PutObjectRequest> captor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(captor.capture(), any(RequestBody.class));
        assertEquals("my-bucket", captor.getValue().bucket());
        assertEquals("image/png", captor.getValue().contentType());
    }

    @Test
    void generatePresignedUrl_withInvalidUrl_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> service.generatePresignedUrl("https://example.com/file", 5));
    }

    @Test
    void generatePresignedUrl_shouldExtractKeyAndPresign() throws Exception {
        ReflectionTestUtils.setField(service, "bucket", "my-bucket");
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedGetObjectRequest);
        when(presignedGetObjectRequest.url()).thenReturn(new URL("https://signed-url"));

        String result = service.generatePresignedUrl("https://my-bucket.s3.ap-southeast-1.amazonaws.com/avatar/file.png", 5);

        assertEquals("https://signed-url", result);
        ArgumentCaptor<GetObjectPresignRequest> captor = ArgumentCaptor.forClass(GetObjectPresignRequest.class);
        verify(s3Presigner).presignGetObject(captor.capture());
        GetObjectRequest request = captor.getValue().getObjectRequest();
        assertEquals("my-bucket", request.bucket());
        assertEquals("avatar/file.png", request.key());
    }

    @Test
    void deleteByUrl_shouldCallDeleteObjectForExtractedKey() {
        ReflectionTestUtils.setField(service, "bucket", "my-bucket");

        service.deleteByUrl("https://my-bucket.s3.ap-southeast-1.amazonaws.com/cv/file.pdf");

        ArgumentCaptor<DeleteObjectRequest> captor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(captor.capture());
        assertEquals("my-bucket", captor.getValue().bucket());
        assertEquals("cv/file.pdf", captor.getValue().key());
    }
}
