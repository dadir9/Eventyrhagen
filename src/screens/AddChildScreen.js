import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../components';
import HeroBanner from '../components/HeroBanner';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme';

const AddChildScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGroup, setChildGroup] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentRelation, setParentRelation] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [errors, setErrors] = useState({});

  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const backIconColor = isDark ? colors.dark.text.secondary : colors.neutral[600];

  const validateForm = () => {
    const newErrors = {};

    if (!childName.trim()) {
      newErrors.childName = t('addChild.errors.nameRequired');
    }

    if (!childAge.trim()) {
      newErrors.childAge = t('addChild.errors.ageRequired');
    } else if (isNaN(parseInt(childAge)) || parseInt(childAge) <= 0) {
      newErrors.childAge = t('addChild.errors.ageInvalid');
    }

    if (!parentName.trim()) {
      newErrors.parentName = t('addChild.errors.parentNameRequired');
    }

    if (parentPhone && !/^\d{8,}$/.test(parentPhone.replace(/\s/g, ''))) {
      newErrors.parentPhone = t('addChild.errors.phoneInvalid');
    }

    if (parentEmail && !/\S+@\S+\.\S+/.test(parentEmail)) {
      newErrors.parentEmail = t('addChild.errors.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Her ville du normalt kalt en API for å lagre barnet
    // For nå viser vi bare en suksessmelding
    Alert.alert(
      t('addChild.success'),
      t('addChild.successMessage', { name: childName }),
      [
        {
          text: t('ok'),
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} showsVerticalScrollIndicator={false}>
      <View style={[
        styles.content,
        {
          padding: isSmallScreen ? 12 : 16,
          paddingBottom: (isSmallScreen ? 16 : 24) + insets.bottom,
        },
      ]}>
        <HeroBanner
          title={t('addChild.title')}
          subtitle={t('addChild.subtitle')}
          badge={{ icon: 'people', label: t('addChild.childInfo') }}
        />
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={backIconColor} />
          <Text style={[styles.backButtonText, { color: backIconColor }]}>{t('back')}</Text>
        </TouchableOpacity>

        {/* Child Information */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('addChild.childInfo')}</Text>
          
          <Input
            label={t('addChild.childName')}
            value={childName}
            onChangeText={setChildName}
            placeholder={t('addChild.childNamePlaceholder')}
            error={errors.childName}
            icon="person-outline"
          />

          <Input
            label={t('addChild.childAge')}
            value={childAge}
            onChangeText={setChildAge}
            placeholder={t('addChild.childAgePlaceholder')}
            keyboardType="numeric"
            error={errors.childAge}
            icon="calendar-outline"
          />

          <Input
            label={t('addChild.childGroup')}
            value={childGroup}
            onChangeText={setChildGroup}
            placeholder={t('addChild.childGroupPlaceholder')}
            icon="people-outline"
          />
        </Card>

        {/* Parent Information */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('addChild.parentInfo')}</Text>

          <Input
            label={t('addChild.parentName')}
            value={parentName}
            onChangeText={setParentName}
            placeholder={t('addChild.parentNamePlaceholder')}
            error={errors.parentName}
            icon="person-outline"
          />

          <Input
            label={t('addChild.parentRelation')}
            value={parentRelation}
            onChangeText={setParentRelation}
            placeholder={t('addChild.parentRelationPlaceholder')}
            icon="heart-outline"
          />

          <Input
            label={t('addChild.parentPhone')}
            value={parentPhone}
            onChangeText={setParentPhone}
            placeholder={t('addChild.parentPhonePlaceholder')}
            keyboardType="phone-pad"
            error={errors.parentPhone}
            icon="call-outline"
          />

          <Input
            label={t('addChild.parentEmail')}
            value={parentEmail}
            onChangeText={setParentEmail}
            placeholder={t('addChild.parentEmailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.parentEmail}
            icon="mail-outline"
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={t('addChild.save')}
            variant="primary"
            size="large"
            onPress={handleSubmit}
            icon={<Ionicons name="checkmark" size={20} color={colors.white} />}
          />
          <Button
            title={t('cancel')}
            variant="ghost"
            size="large"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
});

export default AddChildScreen;
