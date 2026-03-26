package com.example.demo.config;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path uploadPath;

    // ================================
    // Setup upload directory on startup
    // ================================
    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + e.getMessage());
        }
    }

    // ================================
    // Store file and return URL
    // ================================
    public String storeFile(MultipartFile file, String subFolder) {

        // 1. Validate file is not empty
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot upload empty file");
        }

        // 2. Validate file type (only PDF and images)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/")
                && !contentType.equals("application/pdf"))) {
            throw new RuntimeException(
                "Only image files and PDFs are allowed");
        }

        // 3. Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size must be less than 5MB");
        }

        try {
            // 4. Create subfolder if not exists
            Path subFolderPath = this.uploadPath.resolve(subFolder);
            Files.createDirectories(subFolderPath);

            // 5. Generate unique filename to avoid conflicts
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename
                    .substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            // 6. Save file to disk
            Path targetPath = subFolderPath.resolve(newFilename);
            Files.copy(file.getInputStream(), targetPath,
                StandardCopyOption.REPLACE_EXISTING);

            // 7. Return the URL path
            return "/uploads/" + subFolder + "/" + newFilename;

        } catch (IOException e) {
            throw new RuntimeException(
                "Could not store file: " + e.getMessage());
        }
    }

    // ================================
    // Delete file
    // ================================
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl != null && !fileUrl.isEmpty()) {
                String relativePath = fileUrl.replace("/uploads/", "");
                Path filePath = this.uploadPath.resolve(relativePath);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException(
                "Could not delete file: " + e.getMessage());
        }
    }
}
