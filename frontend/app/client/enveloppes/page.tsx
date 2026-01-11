'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { enveloppeSchema, type EnveloppeFormData } from '@/lib/utils/validation';
import { formatCurrency } from '@/lib/utils/format';

export default function EnveloppesPage() {
  const router = useRouter();
  const [montantTotal, setMontantTotal] = useState(0);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EnveloppeFormData>({
    resolver: zodResolver(enveloppeSchema),
    defaultValues: {
      pea: 0,
      cto: 0,
      assurance_vie: 0,
      societe_is: 0,
      taux_is: 15,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const total = 
      (watchedValues.pea || 0) + 
      (watchedValues.cto || 0) + 
      (watchedValues.assurance_vie || 0) + 
      (watchedValues.societe_is || 0);
    setMontantTotal(total);
  }, [watchedValues]);

  const onSubmit = async (data: EnveloppeFormData) => {
    // Récupérer le profil
    const profilStr = localStorage.getItem('client_profil');
    if (!profilStr) {
      alert('Veuillez d\'abord remplir le profil client');
      router.push('/client/profil');
      return;
    }

    // Sauvegarder les enveloppes
    localStorage.setItem('client_enveloppes', JSON.stringify(data));
    router.push('/client/allocation');
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Choix des Enveloppes</CardTitle>
            <CardDescription>Étape 2/6 - Sélectionnez les enveloppes fiscales et montants</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="pea" className="text-lg font-semibold">
                      PEA (Plan d&apos;Épargne en Actions)
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Plafond: 150 000 € - Fiscalité avantageuse après 5 ans
                  </p>
                  <Input
                    id="pea"
                    type="number"
                    step="1000"
                    placeholder="0"
                    {...register('pea', { valueAsNumber: true })}
                  />
                  {errors.pea && (
                    <p className="text-sm text-red-600 mt-1">{errors.pea.message}</p>
                  )}
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="cto" className="text-lg font-semibold">
                      CTO (Compte-Titres Ordinaire)
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Sans plafond - PFU 30% (ou option barème)
                  </p>
                  <Input
                    id="cto"
                    type="number"
                    step="1000"
                    placeholder="0"
                    {...register('cto', { valueAsNumber: true })}
                  />
                  {errors.cto && (
                    <p className="text-sm text-red-600 mt-1">{errors.cto.message}</p>
                  )}
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="assurance_vie" className="text-lg font-semibold">
                      Assurance Vie
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Sans plafond - Fiscalité attractive après 8 ans
                  </p>
                  <Input
                    id="assurance_vie"
                    type="number"
                    step="1000"
                    placeholder="0"
                    {...register('assurance_vie', { valueAsNumber: true })}
                  />
                  {errors.assurance_vie && (
                    <p className="text-sm text-red-600 mt-1">{errors.assurance_vie.message}</p>
                  )}
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="societe_is" className="text-lg font-semibold">
                      Société IS
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Investissement via société à l&apos;IS
                  </p>
                  <Input
                    id="societe_is"
                    type="number"
                    step="1000"
                    placeholder="0"
                    {...register('societe_is', { valueAsNumber: true })}
                  />
                  {errors.societe_is && (
                    <p className="text-sm text-red-600 mt-1">{errors.societe_is.message}</p>
                  )}
                  
                  {watchedValues.societe_is && watchedValues.societe_is > 0 && (
                    <div className="mt-2">
                      <Label htmlFor="taux_is" className="text-sm">
                        Taux IS (%)
                      </Label>
                      <Input
                        id="taux_is"
                        type="number"
                        step="1"
                        {...register('taux_is', { valueAsNumber: true })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Montant Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(montantTotal)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={() => router.push('/client/profil')}>
                  Précédent
                </Button>
                <Button type="submit" disabled={montantTotal === 0}>
                  Suivant : Allocation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
