'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { profilSchema, type ProfilFormData } from '@/lib/utils/validation';
import { SITUATIONS_FAMILIALES } from '@/lib/constants';

export default function ProfilPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfilFormData>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      nom: '',
      age: 35,
      revenu_annuel: 50000,
      situation_familiale: 'celibataire',
      nombre_parts_fiscales: 1,
      taux_imposition: 30,
    },
  });

  const onSubmit = async (data: ProfilFormData) => {
    // Sauvegarder dans le localStorage
    localStorage.setItem('client_profil', JSON.stringify(data));
    router.push('/client/enveloppes');
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Profil Client</CardTitle>
            <CardDescription>Étape 1/6 - Informations personnelles et fiscales</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="nom">Nom du client</Label>
                <Input
                  id="nom"
                  {...register('nom')}
                  placeholder="Jean Dupont"
                />
                {errors.nom && (
                  <p className="text-sm text-red-600 mt-1">{errors.nom.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-600 mt-1">{errors.age.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="revenu_annuel">Revenu annuel (€)</Label>
                  <Input
                    id="revenu_annuel"
                    type="number"
                    {...register('revenu_annuel', { valueAsNumber: true })}
                  />
                  {errors.revenu_annuel && (
                    <p className="text-sm text-red-600 mt-1">{errors.revenu_annuel.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="situation_familiale">Situation familiale</Label>
                <Select id="situation_familiale" {...register('situation_familiale')}>
                  {SITUATIONS_FAMILIALES.map(situation => (
                    <option key={situation.value} value={situation.value}>
                      {situation.label}
                    </option>
                  ))}
                </Select>
                {errors.situation_familiale && (
                  <p className="text-sm text-red-600 mt-1">{errors.situation_familiale.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre_parts_fiscales">Parts fiscales</Label>
                  <Input
                    id="nombre_parts_fiscales"
                    type="number"
                    step="0.5"
                    {...register('nombre_parts_fiscales', { valueAsNumber: true })}
                  />
                  {errors.nombre_parts_fiscales && (
                    <p className="text-sm text-red-600 mt-1">{errors.nombre_parts_fiscales.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="taux_imposition">Taux marginal (%)</Label>
                  <Input
                    id="taux_imposition"
                    type="number"
                    {...register('taux_imposition', { valueAsNumber: true })}
                  />
                  {errors.taux_imposition && (
                    <p className="text-sm text-red-600 mt-1">{errors.taux_imposition.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={() => router.push('/')}>
                  Annuler
                </Button>
                <Button type="submit">
                  Suivant : Enveloppes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
