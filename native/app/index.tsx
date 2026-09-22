import {useState, useEffect} from 'react'
import {useRouter} from 'expo-router'
import {View, ActivityIndicator} from 'react-native'

import {useAuth} from '../context/AuthContext'

export default function Index(){

    const {isAuthenticated, loading} = useAuth();
    const router = useRouter()

    useEffect(() => {
        if(!loading) {
        if(isAuthenticated) {
            router.replace('/(tabs)/orders')
        } else {
            router.replace('/(auth)/login')
        }
    }
    }, [isAuthenticated, loading])

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size='large' />
      </View>
    )
    
}