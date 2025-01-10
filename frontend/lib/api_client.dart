import 'package:dio/dio.dart';
import 'model.dart';

class ApiClient {
  static const baseUrl = "http://localhost:3000";
  static final dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      responseType: ResponseType.json,
    ),
  );

  Future<UserContainer?> createForm(UserContainer container) async {
    try {
      final response = await dio.post(
        '/form',
        data: container.toJson(),
      );
      print("Response: ${response.data}");
      return UserContainer.fromJson(response.data['data']);
    } on DioException catch (_) {
      return null;
    }
  }

  Future<List<UserContainer>> fetchContainers() async {
    try {
      final response = await dio.get(
        '/containers',
      );
      List data = response.data['data'];
      return data.map((json) => UserContainer.fromJson(json)).toList();
    } on DioException catch (_) {
      return [];
    }
  }

  Future<UserContainer?> updateContainer(UserContainer container) async {
    try {
      final response = await dio.put(
        '/containers/${container.containerId}',
        data: container.toJson(),
      );
      return UserContainer.fromJson(response.data['data']);
    } on DioException catch (_) {
      return null;
    }
  }

  Future<bool> deleteContainer(String id) async {
    try {
      final response = await dio.delete(
        '/containers/$id',
      );
      print(response.data);
      return true;
    } on DioException catch (e) {
      print(e.response?.data);
      return false;
    }
  }
}
