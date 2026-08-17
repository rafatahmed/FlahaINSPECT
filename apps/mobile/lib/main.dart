import 'package:flutter/material.dart';

void main() {
  runApp(const FlahaInspectApp());
}

class FlahaInspectApp extends StatelessWidget {
  const FlahaInspectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'FlahaINSPECT',
      home: Scaffold(
        body: Center(
          child: Text('FlahaINSPECT'),
        ),
      ),
    );
  }
}
