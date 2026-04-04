
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(24, GPIO.OUT)

end_time = time.time() + 5  # run for 5 seconds

while time.time() < end_time:
    GPIO.output(24, 1)  # LED ON
    time.sleep(0.3)

    GPIO.output(24, 0)  # LED OFF
    time.sleep(0.3)

GPIO.cleanup()