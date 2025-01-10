class UserContainer {
  String? containerId;
  String name;
  String email;
  int age;
  String gender;
  String address;

  UserContainer({
    this.containerId,
    required this.name,
    required this.email,
    required this.age,
    required this.address,
    required this.gender,
  });

  factory UserContainer.fromJson(Map<String, dynamic> json) {
    return UserContainer(
      containerId: json['containerId'],
      name: json['name'],
      email: json['email'],
      age: json['age'],
      address: json['address'],
      gender: json['gender'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'containerId': containerId,
      'name': name,
      'email': email,
      'age': age,
      'address': address,
      'gender': gender,
    };
  }
}
