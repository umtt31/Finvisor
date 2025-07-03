// components/post/PostImageViewer.js - react-native-image-viewing kullanarak
import React from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import ImageView from 'react-native-image-viewing';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/pro-solid-svg-icons';

const PostImageViewer = ({ visible, imageUri, images = [], initialIndex = 0, onClose }) => {
    // Tek resim veya çoklu resim kontrolü
    const isSingleImage = !images || images.length === 0;

    // Görüntülenecek resimler dizisi
    const imageList = isSingleImage ? [{ uri: imageUri }] : images;

    console.log('🖼️ PostImageViewer:', {
        visible,
        isSingleImage,
        imageList: imageList.length,
        initialIndex
    });

    // ImageView için özel header bileşeni
    const HeaderComponent = ({ imageIndex }) => {
        return (
            <View style={styles.headerContainer}>
                {/* Kapatma butonu */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                >
                    <FontAwesomeIcon icon={faTimes} size={24} color="white" />
                </TouchableOpacity>

                {/* Kaçıncı resim olduğunu gösteren metin */}
                {!isSingleImage && images.length > 1 && (
                    <View style={styles.indexContainer}>
                        <Text style={styles.indexText}>
                            {imageIndex + 1} / {images.length}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    // ImageView için özel footer bileşeni (isteğe bağlı)
    const FooterComponent = ({ imageIndex }) => {
        // Footer istemiyorsanız null döndürebilirsiniz
        return null;
    };

    return (
        <>
            {/* Status bar'ı gizle */}
            {visible && <StatusBar hidden />}

            <ImageView
                images={imageList}
                imageIndex={initialIndex}
                visible={visible}
                onRequestClose={onClose}
                HeaderComponent={HeaderComponent}
                FooterComponent={FooterComponent}
                backgroundColor="rgba(0, 0, 0, 0.95)"
                presentationStyle="overFullScreen"
                animationType="fade"
                swipeToCloseEnabled={true}
                doubleTapToZoomEnabled={true}
                // Kapanma davranışını düzgün yönetmek için
                onLongPress={() => { }}
            // Özel ImageComponent olarak Expo Image kullanmayın
            // Çünkü bu kütüphane kendi içinde RN Image kullanır ve uyumsuzluk yaratabilir
            />
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 90,
        paddingTop: 40,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexContainer: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PostImageViewer;