import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)

buzz = GPIO.PWM(18, 500)   # lower frequency → deeper/low tone
buzz.start(20)             # lower duty cycle → lower volume

time.sleep(0.3)            # short beep

buzz.stop()
GPIO.cleanup()