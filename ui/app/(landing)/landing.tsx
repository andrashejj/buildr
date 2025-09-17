import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { XIcon } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';

export default function LandingPage() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
      <View className="flex-1 items-center p-6">
        <View className="w-full max-w-3xl rounded-lg bg-card p-6">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Image
                source={require('@/assets/images/react-native-reusables-light.png')}
                style={{ width: 38, height: 38 }}
              />
              <Icon as={XIcon} className="size-5 text-muted-foreground" />
              <Text className="text-2xl font-semibold text-foreground">buildr</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Link href="/" asChild>
                <Button size="sm" variant="outline">
                  <Text>Open app</Text>
                </Button>
              </Link>
            </View>
          </View>

          {/* Hero */}
          <View className="mb-6">
            <Text className="mb-2 text-3xl font-bold text-foreground">
              Radical transparency for home renovation
            </Text>
            <Text className="mb-4 text-lg text-muted-foreground">
              Media-first capture, LiDAR-ready measurements, and AI-assisted proposals to turn leads
              into completed jobs — faster and with less back-and-forth.
            </Text>
          </View>

          {/* Personas */}
          <View className="mb-6">
            <Text className="mb-3 text-xl font-semibold text-foreground">Who it is for</Text>
            <View className="mb-3">
              <Text className="text-base font-medium text-foreground">Homeowners</Text>
              <Text className="text-sm text-muted-foreground">
                Capture photos, voice notes, and simple measurements. Get clear, comparable quotes
                and step-by-step guidance so projects move forward with confidence.
              </Text>
            </View>

            <View>
              <Text className="text-base font-medium text-foreground">Professionals</Text>
              <Text className="text-sm text-muted-foreground">
                Win better leads: accept LiDAR-backed measurements, showcase portfolios, and use
                AI-drafted proposals to reduce admin and close jobs faster.
              </Text>
            </View>
          </View>

          {/* Features / Benefits */}
          <View className="mb-6">
            <Text className="mb-3 text-xl font-semibold text-foreground">Key benefits</Text>
            <View className="space-y-3">
              <Text className="text-sm text-muted-foreground">
                • Media-first capture: photos, video, voice, and sketches become structured project
                data.
              </Text>
              <Text className="text-sm text-muted-foreground">
                • AI-assisted scope & pricing: auto-suggested rooms, trades, and realistic budgets.
              </Text>
              <Text className="text-sm text-muted-foreground">
                • Measurement aids & LiDAR support: reduce surprises and speed up proposals.
              </Text>
              <Text className="text-sm text-muted-foreground">
                • Pro toolkit: portfolio, proposal templates, and lead management designed for busy
                trades.
              </Text>
            </View>
          </View>

          {/* Social proof / Testimonials */}
          <View className="mb-6">
            <Text className="mb-3 text-xl font-semibold text-foreground">
              Trusted by homeowners & pros
            </Text>
            <View className="space-y-3">
              <View className="rounded-md bg-muted p-3">
                <Text className="text-sm text-foreground">
                  “Saved me weeks of back-and-forth — clear photos + AI draft made quoting instant.”
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">— Jamie, from the future</Text>
              </View>

              <View className="rounded-md bg-muted p-3">
                <Text className="text-sm text-foreground">
                  “High-quality leads and measurement data cut our site visits in half.”
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">— Marcos, post-launch</Text>
              </View>

              <View className="rounded-md bg-muted p-3">
                <Text className="text-sm text-foreground">
                  “It’s like Tinder, but for contractors… and without the awkward small talk.”
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">— Taylor, case study TBD</Text>
              </View>
            </View>
          </View>

          {/* Mission & vision reinforcement */}
          <View className="mb-6">
            <Text className="mb-2 text-base font-medium text-foreground">Our mission</Text>
            <Text className="text-sm text-muted-foreground">
              Buildr helps homeowners and professionals close renovation projects with less
              uncertainty. We combine media-first workflows, measurement tools, and AI to reduce
              friction and speed decisions.
            </Text>
          </View>

          {/* Footer */}
          <View className="border-divider mt-6 border-t pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} buildr
              </Text>
              <View className="flex-row items-center gap-3">
                <Link href="/about" asChild>
                  <Text className="text-xs text-muted-foreground">Terms</Text>
                </Link>
                <Link href="/about" asChild>
                  <Text className="text-xs text-muted-foreground">Privacy</Text>
                </Link>
                <Link href="mailto:hello@buildr.example" asChild>
                  <Text className="text-xs text-muted-foreground">Contact</Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
