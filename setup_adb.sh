until adb devices 2>&1 > /dev/null
do
  echo 'no device found, make sure your headset is connected via usb'
  echo 'waiting for device...'
  sleep 1
done

HOST=$(adb shell ip route | awk '{ print $9 }')
echo host ip: $HOST

PORT=5555
adb tcpip $PORT
adb connect $HOST:$PORT

read -p 'unplug your device from usb, then press enter to continue'
echo 'continuing...'
adb reverse tcp:8080 tcp:8080

echo 'done'