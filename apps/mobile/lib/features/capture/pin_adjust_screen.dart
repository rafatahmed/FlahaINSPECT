import 'package:flaha_inspect/capture/capture_copy.dart';
import 'package:flaha_inspect/capture/gps_policy.dart';
import 'package:flutter/material.dart';

/// Pre-save pin nudge. flutter_map is PR-13; this is a confirmable offset pad.
class PinAdjustScreen extends StatefulWidget {
  const PinAdjustScreen({super.key, required this.fix});

  final GeoFix fix;

  @override
  State<PinAdjustScreen> createState() => _PinAdjustScreenState();
}

class _PinAdjustScreenState extends State<PinAdjustScreen> {
  late double _lat;
  late double _lng;

  @override
  void initState() {
    super.initState();
    _lat = widget.fix.latitude;
    _lng = widget.fix.longitude;
  }

  void _nudge({double north = 0, double east = 0}) {
    setState(() {
      _lat += north;
      _lng += east;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(adjustPinLabel)),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text('Lat ${_lat.toStringAsFixed(6)}'),
            Text('Lng ${_lng.toStringAsFixed(6)}'),
            const SizedBox(height: 16),
            IconButton(
              onPressed: () => _nudge(north: 0.00005),
              icon: const Icon(Icons.keyboard_arrow_up),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  onPressed: () => _nudge(east: -0.00005),
                  icon: const Icon(Icons.keyboard_arrow_left),
                ),
                const Icon(Icons.place, size: 40),
                IconButton(
                  onPressed: () => _nudge(east: 0.00005),
                  icon: const Icon(Icons.keyboard_arrow_right),
                ),
              ],
            ),
            IconButton(
              onPressed: () => _nudge(north: -0.00005),
              icon: const Icon(Icons.keyboard_arrow_down),
            ),
            const Spacer(),
            FilledButton(
              onPressed: () {
                Navigator.of(context).pop(widget.fix.adjusted(_lat, _lng));
              },
              child: const Text(confirmPinLabel),
            ),
          ],
        ),
      ),
    );
  }
}
