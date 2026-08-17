import 'dart:typed_data';

import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flaha_inspect/capture/ports.dart';
import 'package:flaha_inspect/capture/storage_gate.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';

class GeolocatorSource implements LocationSource {
  @override
  Future<GeoFix?> acquire({Duration timeout = gpsAcquireTimeout}) async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      return null;
    }
    final pos = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
    ).timeout(timeout);
    return GeoFix(
      latitude: pos.latitude,
      longitude: pos.longitude,
      accuracyM: pos.accuracy,
      altitudeM: pos.altitude.isNaN ? null : pos.altitude,
      headingDeg: pos.heading.isNaN ? null : pos.heading,
    );
  }
}

class ImagePickerSource implements PhotoSource {
  ImagePickerSource({ImagePicker? picker}) : _picker = picker ?? ImagePicker();
  final ImagePicker _picker;

  @override
  Future<Uint8List?> capture() async {
    final file = await _picker.pickImage(source: ImageSource.camera, imageQuality: 100);
    if (file == null) return null;
    return file.readAsBytes();
  }
}

class UnknownDiskSpace implements DiskSpace {
  @override
  Future<int?> freeBytes() async => null;
}
