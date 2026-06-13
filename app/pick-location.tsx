// Map-based delivery-location picker.
//
// Renders OpenStreetMap via Leaflet inside a WebView — deliberately NOT Google
// Maps: no API key, no Google Cloud billing, and no dependency on Google Play
// Services, all of which are problematic for our Syria target. The map's CENTER
// is the selected point; a fixed pin is drawn over the center by RN, so panning
// the map under the pin chooses a spot. expo-location powers "use my location".
//
// Input/output go through the useLocationPicker store (not navArgs) so we don't
// clobber the edit context add-address.tsx keeps in navArgs.
import React, { useRef, useState } from 'react';
import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppColors, w, h, r, sp } from '@/theme';
import { t, useI18n } from '@/i18n';
import { BaseText } from '@/components';
import { showSnack } from '@/lib/snack';
import { goBack } from '@/lib/nav';
import { DEFAULT_CENTER, type LatLng } from '@/lib/cities';
import { useLocationPicker } from '@/features/addresses/locationPicker';

// Leaflet/OSM map. The map center is the chosen point; `moveend` posts it back
// to RN, and window.recenter(lat,lng) lets RN drive the map to the GPS fix.
function buildHtml(center: LatLng): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #e8eef1; }
  .leaflet-control-attribution { font-size: 9px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  function send(obj) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  }
  try {
    var map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${center.lat}, ${center.lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    function emit() {
      var c = map.getCenter();
      send({ type: 'move', lat: c.lat, lng: c.lng });
    }
    map.on('moveend', emit);
    window.recenter = function (lat, lng) { map.setView([lat, lng], 17); };
    emit();
    send({ type: 'ready' });
  } catch (e) {
    send({ type: 'error', message: String(e) });
  }
</script>
</body>
</html>`;
}

export default function PickLocationScreen() {
  const router = useRouter();
  const { isRTL } = useI18n();

  // Captured once: the WebView source must not rebuild when the live center
  // changes, or the map would reset on every pan.
  const [initial] = useState<LatLng>(
    () => useLocationPicker.getState().initial ?? DEFAULT_CENTER,
  );
  const [center, setCenter] = useState<LatLng>(initial);
  const [locating, setLocating] = useState(false);
  const webRef = useRef<WebView>(null);
  const html = React.useMemo(() => buildHtml(initial), [initial]);

  // The picker is shared (saved addresses + Jawlaha Box stops/destination); the
  // opener records where to return via the locationPicker store. Default to the
  // saved-address flow so existing callers are unaffected.
  const [returnTo] = useState<string>(
    () => useLocationPicker.getState().returnTo ?? '/add-address',
  );

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'move' && typeof msg.lat === 'number') {
        setCenter({ lat: msg.lat, lng: msg.lng });
      }
    } catch {
      // Ignore malformed messages.
    }
  };

  const useMyLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showSnack(t('location_permission_denied'), 'info');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const next = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setCenter(next);
      webRef.current?.injectJavaScript(`window.recenter(${next.lat}, ${next.lng}); true;`);
    } catch {
      showSnack(t('location_unavailable'), 'error');
    } finally {
      setLocating(false);
    }
  };

  const onConfirm = () => {
    useLocationPicker.getState().setResult(center);
    goBack(router, returnTo);
  };

  const backIcon = isRTL ? 'arrow-forward' : 'arrow-back';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => goBack(router, returnTo)} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name={backIcon as any} size={sp(24)} color={AppColors.textColorTheme} />
        </Pressable>
        <BaseText
          title={t('pick_location_title')}
          size={sp(18)}
          fontWeight="bold"
          color={AppColors.textColorTheme}
        />
        <View style={styles.iconBtn} />
      </View>
      <View style={styles.divider} />

      {/* Map */}
      <View style={styles.mapWrap}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={onMessage}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />

        {/* Fixed center pin — the tip points at the map center. Non-interactive
            so it never eats map gestures. */}
        <View pointerEvents="none" style={styles.pinWrap}>
          <MaterialIcons
            name="place"
            size={sp(44)}
            color={AppColors.primaryColorTheme}
            style={{ transform: [{ translateY: -sp(22) }] }}
          />
        </View>

        {/* Hint */}
        <View pointerEvents="none" style={styles.hint}>
          <BaseText
            title={t('drag_map_hint')}
            size={sp(12)}
            color={AppColors.white}
            style={{ textAlign: 'center' }}
          />
        </View>

        {/* Use my current location */}
        <Pressable onPress={useMyLocation} disabled={locating} style={styles.gpsBtn}>
          {locating ? (
            <ActivityIndicator size="small" color={AppColors.primaryColorTheme} />
          ) : (
            <MaterialIcons name="my-location" size={sp(22)} color={AppColors.primaryColorTheme} />
          )}
        </Pressable>
      </View>

      {/* Confirm */}
      <View style={styles.bottomBar}>
        <BaseText
          title={`${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`}
          size={sp(12)}
          color={AppColors.textColor2}
          style={{ textAlign: 'center', marginBottom: h(8) }}
        />
        <Pressable onPress={onConfirm} style={styles.confirmBtn}>
          <BaseText
            title={t('confirm_location_btn')}
            size={sp(16)}
            fontWeight="bold"
            color={AppColors.white}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.backgroundColor },
  appBar: {
    height: h(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(8),
    backgroundColor: AppColors.white,
  },
  iconBtn: { width: w(40), height: w(40), alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(143,169,189,0.3)' },
  mapWrap: { flex: 1, overflow: 'hidden' },
  map: { flex: 1, backgroundColor: '#e8eef1' },
  pinWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    position: 'absolute',
    top: h(12),
    alignSelf: 'center',
    maxWidth: '85%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: w(12),
    paddingVertical: h(6),
    borderRadius: r(16),
  },
  gpsBtn: {
    position: 'absolute',
    bottom: h(16),
    right: w(16),
    width: w(48),
    height: w(48),
    borderRadius: 999,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  bottomBar: {
    padding: w(16),
    backgroundColor: AppColors.white,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  confirmBtn: {
    width: '100%',
    height: h(52),
    backgroundColor: AppColors.primaryColorTheme,
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
