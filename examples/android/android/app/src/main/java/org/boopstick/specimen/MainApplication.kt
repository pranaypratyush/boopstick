// Derived from Community template 0.88.0; see THIRD_PARTY_NOTICES.md.
package org.boopstick.specimen

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {
  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages,
      useDevSupport = false,
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
