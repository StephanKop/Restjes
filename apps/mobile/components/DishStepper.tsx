import { Fragment, useEffect, useRef } from 'react'
import { Animated, Easing, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const DOT_SIZE = 36
const LINE_HEIGHT = 2
const CONNECTOR_TOP = (DOT_SIZE - LINE_HEIGHT) / 2

type StepState = 'done' | 'current' | 'todo'

function StepCircle({ state, index }: { state: StepState; index: number }) {
  const scale = useRef(new Animated.Value(1)).current
  const prev = useRef<StepState>(state)

  useEffect(() => {
    if (prev.current !== state) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.15, friction: 5, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start()
      prev.current = state
    }
  }, [state, scale])

  return (
    <Animated.View
      style={{ transform: [{ scale }], width: DOT_SIZE, height: DOT_SIZE }}
      className={`rounded-full items-center justify-center ${
        state === 'done'
          ? 'bg-brand-500'
          : state === 'current'
          ? 'bg-white border-2 border-brand-500'
          : 'bg-warm-100'
      }`}
    >
      {state === 'done' ? (
        <Ionicons name="checkmark" size={18} color="#fff" />
      ) : (
        <Text
          className={`text-sm font-bold ${
            state === 'current' ? 'text-brand-600' : 'text-warm-400'
          }`}
        >
          {index + 1}
        </Text>
      )}
    </Animated.View>
  )
}

function StepConnector({ active }: { active: boolean }) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [active, progress])

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View
      style={{ flex: 1, height: LINE_HEIGHT, marginTop: CONNECTOR_TOP }}
      className="bg-warm-200 rounded-full overflow-hidden mx-1"
    >
      <Animated.View style={{ width, height: LINE_HEIGHT }} className="bg-brand-500" />
    </View>
  )
}

export function DishStepper({ labels, step }: { labels: string[]; step: number }) {
  return (
    <View className="flex-row items-start justify-center px-6 pt-4 pb-2">
      {labels.map((label, i) => {
        const state: StepState = i < step ? 'done' : i === step ? 'current' : 'todo'
        return (
          <Fragment key={label}>
            <View className="items-center" style={{ width: 72 }}>
              <StepCircle state={state} index={i} />
              <Text
                numberOfLines={1}
                className={`text-xs mt-1 ${
                  state === 'current' ? 'text-brand-600 font-bold' : 'text-warm-400'
                }`}
              >
                {label}
              </Text>
            </View>
            {i < labels.length - 1 && <StepConnector active={i < step} />}
          </Fragment>
        )
      })}
    </View>
  )
}
