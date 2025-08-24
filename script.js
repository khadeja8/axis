import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: BottomNavExample(),
    );
  }
}

class BottomNavExample extends StatefulWidget {
  @override
  _BottomNavExampleState createState() => _BottomNavExampleState();
}

class _BottomNavExampleState extends State<BottomNavExample> {
  int _selectedIndex = 0;

  // هنا نخزن الشاشات مرة وحدة
  final List<Widget> _screens = [
    HomeScreen(),
    ProfileScreen(),
    SettingsScreen(),
    HelpScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex], // هنا تتغير الشاشة حسب الاختيار
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: "Settings"),
          BottomNavigationBarItem(icon: Icon(Icons.help), label: "Help"),
        ],
      ),
    );
  }
}

// ---------------- شاشات منفصلة ----------------
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Home Screen"));
  }
}

class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Profile Screen"));
  }
}

class SettingsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Settings Screen"));
  }
}

class HelpScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Help Screen"));
  }
}
// -------------------------------
// الكود الأصلي مال البارحة (خليه مثل ما هو)
// -------------------------------

// اذا عندك اكواد من قبل لا تمسحها، بس خلهه فوق
// مثلاً:
// console.log("Script.js is connected!");


// -------------------------------
// الإضافة الجديدة (تأثير على صورة محمود)
// -------------------------------

// نجيب الصورة من الصفحة (انت مستخدم الكلاس مال css)
const mahmoodImg = document.querySelector('.mahmood-photo');

// نتأكد إذا موجودة الصورة قبل نسوي أي شي
if (mahmoodImg) {
  // إذا المستخدم ضغط على الصورة
  mahmoodImg.addEventListener('click', () => {
    // تكبر الصورة مؤقتاً
    mahmoodImg.style.transform = 'scale(1.1)';
    mahmoodImg.style.transition = 'transform 0.3s ease';

    // بعد نص ثانية ترجع للوضع الطبيعي
    setTimeout(() => {
      mahmoodImg.style.transform = 'scale(1)';
    }, 300);
  });
}
