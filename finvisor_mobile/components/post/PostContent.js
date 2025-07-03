// components/post/PostContent.js - PostImageViewer ile Geliştirilmiş
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, Pressable } from 'react-native';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Image } from 'expo-image';
import { Image as RNImage } from 'react-native';
import PostImageViewer from './PostImageViewer';

const { width, height } = Dimensions.get("window");
// Maximum height limit (60% of screen height)
const MAX_IMAGE_HEIGHT = height * 0.6;
// Standard width (90% of screen)
const CONTAINER_WIDTH = width * 0.9;

const PostContent = ({ post }) => {
  // Image dimensions cache
  const [imageRatio, setImageRatio] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [dimensionsReady, setDimensionsReady] = useState(false);
  const [calculatedHeight, setCalculatedHeight] = useState(300); // Default height

  // Image viewer modal state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  // Handle image load start
  const handleImageLoadStart = () => {
    console.log('🔄 Image loading started');
    setImageLoaded(false);
    setImageError(false);
  };

  // Handle image load
  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully');
    setImageLoaded(true);
  };

  // Handle image error
  const handleImageError = (error) => {
    console.log('❌ Image load error:', error.nativeEvent);
    setImageError(true);
    setImageLoaded(true);
  };

  // Prepare image URI - backend'den gelen image field'ını direkt kullan
  const prepareImageUri = (imageField) => {
    if (!imageField || imageField.trim() === '') {
      console.log('⚠️ No image field provided');
      return null;
    }

    let imageUri = imageField.trim();
    console.log('🔍 Original image field:', imageUri);

    // Eğer tam URL değilse, backend base URL'i ekle
    if (!imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
      const BACKEND_BASE_URL = 'https://api-social-sanalrekabet.b-cdn.net/';
      imageUri = BACKEND_BASE_URL + imageUri;
    }

    return imageUri;
  };

  const imageUri = prepareImageUri(post.image);

  // Open image in full screen
  const openImageViewer = () => {
    if (imageUri && dimensionsReady) {
      console.log('🖼️ Opening PostImageViewer');
      setImageViewerVisible(true);
    }
  };

  // Close image viewer
  const closeImageViewer = () => {
    console.log('❌ Closing PostImageViewer');
    setImageViewerVisible(false);
  };

  // Pre-load image and calculate dimensions
  useEffect(() => {
    if (!imageUri) {
      setDimensionsReady(true);
      return;
    }

    console.log('📏 Starting dimension calculation for:', imageUri);
    setDimensionsReady(false);

    // Use RN's Image.getSize to get dimensions
    const getImageSize = () => {
      return new Promise((resolve, reject) => {
        RNImage.getSize(
          imageUri,
          (width, height) => {
            console.log('📐 Image dimensions:', { width, height });
            resolve({ width, height });
          },
          (error) => {
            console.log('❌ Failed to get image size:', error);
            reject(error);
          }
        );
      });
    };

    const calculateDimensions = async () => {
      try {
        const { width: imgWidth, height: imgHeight } = await getImageSize();

        if (imgWidth && imgHeight) {
          // Calculate aspect ratio
          const ratio = imgWidth / imgHeight;
          console.log('🔢 Calculated ratio:', ratio);

          // Calculate display height based on container width
          const calculatedDisplayHeight = CONTAINER_WIDTH / ratio;

          // Check if calculated height exceeds maximum
          const finalHeight = Math.min(calculatedDisplayHeight, MAX_IMAGE_HEIGHT);

          console.log('📊 Height calculation:', {
            calculatedDisplayHeight,
            maxHeight: MAX_IMAGE_HEIGHT,
            finalHeight
          });

          // Update states
          setImageRatio(ratio);
          setCalculatedHeight(finalHeight);
          setDimensionsReady(true);
        }
      } catch (error) {
        console.log('❌ Could not measure image size:', error);
        // Default values in case of error
        setImageRatio(1);
        setCalculatedHeight(CONTAINER_WIDTH); // Square fallback
        setDimensionsReady(true);
      }
    };

    calculateDimensions();
  }, [imageUri]);

  // Calculate display dimensions
  const displayDimensions = useMemo(() => {
    if (!imageRatio || !dimensionsReady) {
      return {
        width: CONTAINER_WIDTH,
        height: calculatedHeight,
        containerHeight: calculatedHeight
      };
    }

    // Calculate image dimensions
    const calculatedDisplayHeight = CONTAINER_WIDTH / imageRatio;
    const isOverHeight = calculatedDisplayHeight > MAX_IMAGE_HEIGHT;

    // Actual dimensions to display
    const displayHeight = isOverHeight ? MAX_IMAGE_HEIGHT : calculatedDisplayHeight;
    const displayWidth = isOverHeight ? MAX_IMAGE_HEIGHT * imageRatio : CONTAINER_WIDTH;

    return {
      width: displayWidth,
      height: displayHeight,
      containerHeight: displayHeight,
      isOverHeight
    };
  }, [imageRatio, dimensionsReady, calculatedHeight]);

  // Debug için post verisini logla
  useEffect(() => {
    console.log('🎯 Post data debug:', {
      hasContent: !!post.content,
      hasImage: !!post.image,
      imageUri: imageUri || 'none'
    });
  }, [post, imageUri]);

  return (
    <View style={styles.container}>
      {/* Text Content */}
      {post.content && (
        <Text style={styles.contentText}>
          {post.content}
        </Text>
      )}

      {/* Image Content with Dynamic Sizing */}
      {imageUri && !imageError && (
        <View style={styles.imageWrapper}>
          <Pressable
            style={[
              styles.imageContainer,
              {
                width: width * 0.95,
                height: displayDimensions.containerHeight,
                backgroundColor: '#121212', // Dark background
              }
            ]}
            onPress={() => {
              if (!dimensionsReady) return;
              openImageViewer();
            }}
          >
            {/* Background with blurred version - always visible */}
            <View style={styles.backgroundContainer}>
              <RNImage
                source={{ uri: imageUri }}
                style={styles.backgroundImage}
                blurRadius={25}
                onError={() => console.log('❌ Background image error')}
              />
              {/* Darkening overlay */}
              <View style={styles.backgroundOverlay} />
            </View>

            {/* Loading indicator - show when dimensions are not ready */}
            {!dimensionsReady && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Resim yükleniyor...</Text>
              </View>
            )}

            {/* Main image - shown when dimensions are ready */}
            {dimensionsReady && (
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.mainImage,
                  {
                    width: displayDimensions.width,
                    height: displayDimensions.height,
                  }
                ]}
                cachePolicy="memory-disk"
                contentFit="contain"
                transition={300}
                placeholder={imageUri}
                placeholderContentFit="cover"
                onLoadStart={handleImageLoadStart}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}


          </Pressable>

          {/* Error placeholder */}
          {imageError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Görüntü yüklenemedi
              </Text>
              <Text style={styles.errorDetail}>
                {imageUri}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* PostImageViewer Component */}
      <PostImageViewer
        visible={imageViewerVisible}
        imageUri={imageUri}
        onClose={closeImageViewer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  contentText: {
    fontFamily: 'Jost',
    color: 'white',
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 20,
  },
  imageWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    zIndex: 1,
  },
  backgroundImage: {
    width: '110%',
    height: '110%',
    position: 'absolute',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  mainImage: {
    alignSelf: 'center',
    zIndex: 2,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  debugContainer: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 4,
    borderRadius: 4,
    zIndex: 4,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});

export default PostContent;