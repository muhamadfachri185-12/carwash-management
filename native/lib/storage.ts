// AsyncStorage digunakan untuk menyimpan data secara lokal di device.
//
// Konsepnya mirip seperti localStorage di website,
// tetapi digunakan di React Native.
//
// Contoh data yang bisa disimpan:
// - token login
// - informasi user
// - setting aplikasi
import AsyncStorage from "@react-native-async-storage/async-storage"

// Kita membuat kumpulan key yang digunakan untuk menyimpan data.
//
// Kenapa dibuat seperti ini?
// Supaya kita tidak perlu menulis "@carwash-token"
// dan "@carwash_user" berkali-kali di banyak tempat.
//
// Jadi nanti cukup:
// KEYS.TOKEN
// KEYS.USER
const KEYS = {
  TOKEN: "@carwash-token",
  USER: "@carwash_user",
}

// Kita membuat object "storage"
// yang berisi fungsi-fungsi untuk mengatur data di AsyncStorage.
//
// Jadi daripada kita memanggil AsyncStorage langsung di banyak file:
//
// AsyncStorage.getItem(...)
// AsyncStorage.setItem(...)
//
// kita cukup menggunakan:
//
// storage.getToken()
// storage.setToken()
// storage.getUser()
// dan lain-lain.
//
// Ini membuat kode aplikasi lebih rapi.
export const storage = {
  // =====================================================
  // GET TOKEN
  // =====================================================

  // Fungsi untuk mengambil token yang sebelumnya disimpan.
  //
  // Promise<string | null> artinya:
  // - fungsi ini bekerja secara asynchronous
  // - hasil akhirnya bisa berupa string
  // - atau null kalau token tidak ditemukan
  async getToken(): Promise<string | null> {
    try {
      // getItem() digunakan untuk mengambil data berdasarkan key.
      //
      // Karena AsyncStorage bekerja secara asynchronous,
      // kita menggunakan await untuk menunggu hasilnya.
      //
      // Misalnya sebelumnya kita menyimpan:
      //
      // setToken("abc123")
      //
      // Maka getToken() akan menghasilkan:
      //
      // "abc123"
      return await AsyncStorage.getItem(KEYS.TOKEN)
    } catch (error) {
      // Kalau terjadi error saat mengambil token,
      // kita tampilkan error di console.
      console.error("Error getting token:", error)

      // Kalau gagal mengambil token,
      // kita kembalikan null.
      return null
    }
  },

  // =====================================================
  // SET TOKEN
  // =====================================================

  // Fungsi untuk menyimpan token.
  //
  // Parameter:
  // token: string
  //
  // Artinya fungsi ini membutuhkan token berupa string.
  //
  // Contoh:
  //
  // storage.setToken("eyJhbGciOi...")
  async setToken(token: string): Promise<void> {
    try {
      // setItem() digunakan untuk menyimpan data.
      //
      // Bentuknya:
      //
      // AsyncStorage.setItem(KEY, VALUE)
      //
      // Contoh:
      //
      // AsyncStorage.setItem("@carwash-token", "abc123")
      //
      // Setelah ini token tersimpan di device.
      await AsyncStorage.setItem(KEYS.TOKEN, token)
    } catch (error) {
      // Menampilkan error jika proses penyimpanan gagal.
      console.error("Error setting token:", error)
    }
  },

  // =====================================================
  // REMOVE TOKEN
  // =====================================================

  // Fungsi untuk menghapus token.
  //
  // Biasanya fungsi ini dipanggil ketika user melakukan logout.
  async removeToken(): Promise<void> {
    try {
      // removeItem() digunakan untuk menghapus data
      // berdasarkan key tertentu.
      //
      // Jadi data:
      //
      // @carwash-token
      //
      // akan dihapus dari AsyncStorage.
      await AsyncStorage.removeItem(KEYS.TOKEN)
    } catch (error) {
      console.error("Error removing token", error)
    }
  },

  // =====================================================
  // GET USER
  // =====================================================

  // Fungsi untuk mengambil data user.
  //
  // Kita menggunakan "any" untuk sementara.
  //
  // Nantinya lebih bagus kalau dibuat interface/type
  // khusus untuk User.
  async getUser(): Promise<any | null> {
    try {
      // Ambil data user berdasarkan key USER.
      //
      // Perlu diperhatikan:
      // AsyncStorage hanya menyimpan data dalam bentuk STRING.
      //
      // Jadi misalnya kita menyimpan object:
      //
      // {
      //   id: 1,
      //   name: "Fachri",
      //   role: "STAFF"
      // }
      //
      // Yang sebenarnya tersimpan adalah string JSON.
      const userJson = await AsyncStorage.getItem(KEYS.USER)

      // Kalau userJson ada:
      //
      // JSON.parse(userJson)
      //
      // digunakan untuk mengubah string JSON
      // kembali menjadi object JavaScript.
      //
      // Kalau userJson tidak ada/null:
      //
      // kita mengembalikan null.
      return userJson ? JSON.parse(userJson) : null
    } catch (error) {
      console.error("Error getting user:", error)

      return null
    }
  },

  // =====================================================
  // SET USER
  // =====================================================

  // Fungsi untuk menyimpan data user.
  //
  // Parameter user bisa berupa object.
  //
  // Contoh:
  //
  // {
  //   id: 1,
  //   name: "Fachri",
  //   role: "STAFF"
  // }
  async setUser(user: any): Promise<void> {
    try {
      // AsyncStorage hanya bisa menyimpan STRING.
      //
      // Sedangkan user biasanya berupa OBJECT.
      //
      // Oleh karena itu kita harus mengubah object
      // menjadi string JSON terlebih dahulu.
      //
      // JSON.stringify():
      //
      // OBJECT
      // ↓
      // STRING
      //
      // Contoh:
      //
      // { id: 1, name: "Fachri" }
      //
      // menjadi:
      //
      // '{"id":1,"name":"Fachri"}'
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user))
    } catch (error) {
      console.error("Error setting user:", error)
    }
  },

  // =====================================================
  // REMOVE USER
  // =====================================================

  // Fungsi untuk menghapus data user dari AsyncStorage.
  //
  // Biasanya juga digunakan ketika logout.
  async removeUser(): Promise<void> {
    try {
      // Hapus data berdasarkan key USER.
      await AsyncStorage.removeItem(KEYS.USER)
    } catch (error) {
      console.error("Error removing user:", error)
    }
  },

  // =====================================================
  // CLEAR ALL
  // =====================================================

  // Fungsi ini digunakan untuk menghapus semua data
  // yang kita simpan di storage.
  //
  // Dalam kasus kita:
  //
  // - token
  // - user
  //
  // Biasanya fungsi seperti ini juga digunakan ketika logout.
  async clearAll(): Promise<void> {
    try {
      // multiRemove() memungkinkan kita menghapus
      // beberapa key sekaligus.
      //
      // Daripada:
      //
      // await AsyncStorage.removeItem(KEYS.TOKEN)
      // await AsyncStorage.removeItem(KEYS.USER)
      //
      // kita bisa langsung:
      //
      // multiRemove([KEYS.TOKEN, KEYS.USER])
      await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER])
    } catch (error) {
      console.error("Error removing user:", error)
    }
  },
}
